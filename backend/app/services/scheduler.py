import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.future import select
from app.db.session import SessionLocal
from app.models.schedule import ReportSchedule
from app.models.report import Report
from app.services.reports import generate_global_audit, generate_pdf
from app.utils.email import send_report_email
from app.core.config import settings
import os

logger = logging.getLogger(__name__)

async def check_and_run_schedules():
    """
    Infinite loop that checks for due report schedules and executes them.
    """
    logger.info("Starting background report scheduler...")
    while True:
        try:
            async with SessionLocal() as db:
                # 1. Fetch due schedules
                now = datetime.now()
                result = await db.execute(
                    select(ReportSchedule).where(
                        ReportSchedule.is_active == True,
                        ReportSchedule.next_run_at <= now
                    )
                )
                due_schedules = result.scalars().all()

                for schedule in due_schedules:
                    logger.info(f"Executing scheduled report: {schedule.name} for user {schedule.user_id}")
                    
                    # Create the report record early with "Processing" status
                    new_report = Report(
                        user_id=schedule.user_id,
                        name=f"{schedule.name} (Auto)",
                        status="Processing",
                        type=schedule.type,
                        format="PDF",
                        company_id=schedule.company_id,
                        email_status="Scheduled" if schedule.recipient_emails else "N/A",
                        recipient_emails=schedule.recipient_emails
                    )
                    db.add(new_report)
                    await db.commit()
                    await db.refresh(new_report)

                    try:
                        # 2. Generate report
                        report_path = None
                        if schedule.type == "Global":
                            report_path = await generate_global_audit(db, schedule.user_id)
                        elif schedule.type == "Company" and schedule.company_id:
                            report_path = await generate_pdf(db, schedule.company_id)
                        else:
                            report_path = await generate_global_audit(db, schedule.user_id)

                        if not report_path or not os.path.exists(report_path):
                            raise Exception("Failed to generate report file")

                        # 3. Update report record
                        filename = os.path.basename(report_path)
                        new_report.status = "Completed"
                        new_report.size = f"{os.path.getsize(report_path) / 1024 / 1024:.1f} MB"
                        new_report.url = filename
                        
                        # 4. Send email if recipients exist
                        if schedule.recipient_emails:
                            try:
                                success = send_report_email(
                                    recipient_emails=schedule.recipient_emails,
                                    report_path=report_path,
                                    report_name=schedule.name
                                )
                                if success:
                                    new_report.email_status = "Sent"
                                    new_report.email_delivered_at = datetime.now()
                                else:
                                    new_report.email_status = "Failed"
                                    new_report.delivery_error = "SMTP delivery failed (check logs/credentials)"
                            except Exception as email_err:
                                logger.error(f"Email send error for schedule {schedule.id}: {str(email_err)}")
                                new_report.email_status = "Failed"
                                new_report.delivery_error = str(email_err)

                        # 5. Update schedule next run
                        schedule.last_run_at = now
                        # Calculate next run properly
                        try:
                            hour, minute = map(int, schedule.time.split(':'))
                            # Determine start date for next run calculation
                            start_date = now + timedelta(minutes=1)
                            next_run = start_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                            
                            while next_run <= now:
                                if schedule.frequency == "Daily":
                                    next_run += timedelta(days=1)
                                elif schedule.frequency == "Weekly":
                                    next_run += timedelta(weeks=1)
                                elif schedule.frequency == "Monthly":
                                    next_run += timedelta(days=30)
                                else:
                                    next_run += timedelta(days=1)
                            schedule.next_run_at = next_run
                        except Exception as time_err:
                            logger.error(f"Time parsing error for schedule {schedule.id}: {str(time_err)}")
                            schedule.next_run_at = now + timedelta(days=1)
                        
                        await db.commit()
                        logger.info(f"Successfully completed scheduled report: {schedule.name}. Next run: {schedule.next_run_at}")
                        
                    except Exception as e:
                        logger.error(f"Error executing schedule {schedule.id}: {str(e)}")
                        new_report.status = "Failed"
                        new_report.error_message = str(e)
                        await db.commit()

        except Exception as e:
            logger.error(f"Scheduler loop error: {str(e)}")
        
        # Sleep for 1 minute before next check
        await asyncio.sleep(60)

def start_scheduler():
    """Helper to start the scheduler in the background."""
    asyncio.create_task(check_and_run_schedules())
