from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import os
import tempfile
import uuid
import logging
import asyncio

from app.db.session import SessionLocal, get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.report import Report
from app.models.schedule import ReportSchedule
from app.services.reports import generate_pdf, generate_global_audit
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

async def background_generate_report(report_id: int, user_id: int):
    """Actual generation logic running in background with safe error handling."""
    logger.info(f"Starting background task for report {report_id}")
    try:
        # Give DB a moment to settle after commit if needed (optional)
        await asyncio.sleep(0.5)
        
        async with SessionLocal() as db:
            # 1. Fetch report
            result = await db.execute(select(Report).where(Report.id == report_id))
            report = result.scalars().first()
            if not report:
                logger.error(f"Report {report_id} not found in background task")
                return

            # 2. Update status to Processing
            report.status = "Processing"
            await db.commit()
            await db.refresh(report)
            logger.info(f"Report {report_id} status updated to Processing")

            # 3. Generate the actual PDF
            logger.info(f"Initiating PDF synthesis for report {report_id} (Type: {report.type})")
            report_path = None
            try:
                if report.type == "Global":
                    report_path = await generate_global_audit(db, user_id)
                elif report.type == "Company" and report.company_id:
                    report_path = await generate_pdf(db, report.company_id)
                else:
                    report_path = await generate_global_audit(db, user_id)
                
                if not report_path or not os.path.exists(report_path):
                    raise Exception("Report generation service returned invalid path or file does not exist")
                    
                logger.info(f"PDF generated at: {report_path}")
                filename = os.path.basename(report_path)
                
                # 4. Finalize report record
                report.status = "Completed"
                report.size = f"{os.path.getsize(report_path) / 1024 / 1024:.1f} MB"
                # Store only the filename in URL or a proper relative path
                report.url = filename 
                report.error_message = None
                
                logger.info(f"Report {report_id} finalized and ready for download")
                await db.commit()
            except Exception as gen_err:
                logger.error(f"Generation error for report {report_id}: {str(gen_err)}")
                report.status = "Failed"
                report.error_message = str(gen_err)
                await db.commit()
                
    except Exception as e:
        logger.error(f"Critical background report generation failure for {report_id}: {str(e)}", exc_info=True)
        # Final attempt to mark as failed
        try:
            async with SessionLocal() as db:
                result = await db.execute(select(Report).where(Report.id == report_id))
                report = result.scalars().first()
                if report:
                    report.status = "Failed"
                    report.error_message = f"Critical Error: {str(e)}"
                    await db.commit()
        except:
            pass

@router.post("/global-audit")
async def create_global_audit(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a global summary report for the current user.
    """
    new_report = Report(
        user_id=current_user.id,
        name=f"Intelligence Audit - {datetime.now().strftime('%b %d, %Y')}",
        status="Processing",
        type="Global",
        format="PDF",
        size="Processing..."
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    # Add to background tasks
    background_tasks.add_task(background_generate_report, new_report.id, current_user.id)
    
    return {
        "id": new_report.id,
        "task_id": new_report.id,
        "message": "Global intelligence audit initiated",
        "status": new_report.status,
        "report_name": new_report.name
    }

@router.get("/history")
async def get_reports_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all past reports for the user."""
    reports_result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
    )
    reports = reports_result.scalars().all()
    
    # Also fetch schedules for the general status overview
    schedules_result = await db.execute(
        select(ReportSchedule).where(ReportSchedule.user_id == current_user.id)
    )
    schedules = schedules_result.scalars().all()

    return {
        "reports": [
            {
                "id": r.id, 
                "name": r.name, 
                "status": r.status, 
                "date": r.created_at.strftime("%Y-%m-%d"),
                "type": r.type,
                "format": r.format,
                "size": r.size,
                "error_message": r.error_message,
                "created_at": r.created_at,
                "email_status": r.email_status,
                "email_delivered_at": r.email_delivered_at,
                "delivery_error": r.delivery_error,
                "recipient_emails": r.recipient_emails
            } for r in reports
        ],
        "schedules": [
            {
                "id": s.id,
                "name": s.name,
                "frequency": s.frequency,
                "time": s.time,
                "next_run": s.next_run_at.strftime("%Y-%m-%d %H:%M") if s.next_run_at else "Not set",
                "is_active": s.is_active
            } for s in schedules
        ]
    }

@router.get("/status")
async def get_all_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Legacy endpoint for status - redirects to history style data but renamed for clarity."""
    # This is kept for backward compatibility if any other module uses it
    return await get_reports_history(db, current_user)

@router.get("/status/{report_id}")
async def get_report_status(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get status of a specific report generation task."""
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report task not found")
    
    return {
        "id": report.id,
        "status": report.status,
        "name": report.name,
        "error_message": report.error_message,
        "size": report.size,
        "ready": report.status == "Completed"
    }

@router.get("/download/{report_id}")
async def download_report_by_id(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download a report file by its database ID."""
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status != "Completed" or not report.url:
        raise HTTPException(status_code=400, detail="Report is not ready for download")

    filename = report.url
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=400, detail="Invalid report file reference")

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    
    if not os.path.exists(file_path):
        logger.error(f"Report file {file_path} missing for report {report_id}")
        raise HTTPException(status_code=404, detail="Physical report file not found on server")
    
    return FileResponse(
        path=file_path, 
        filename=f"{report.name.replace(' ', '_')}.pdf", 
        media_type='application/pdf'
    )

@router.post("/schedules")
async def create_report_schedule(
    schedule_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_schedule = ReportSchedule(
        user_id=current_user.id,
        name=schedule_data.get("name"),
        type=schedule_data.get("type", "Global"),
        frequency=schedule_data.get("frequency", "Weekly"),
        time=schedule_data.get("time", "09:00"),
        recipient_emails=schedule_data.get("recipients"),
        company_id=schedule_data.get("company_id")
    )
    
    # Calculate initial next_run_at based on frequency and time
    try:
        hour, minute = map(int, new_schedule.time.split(':'))
        next_run = datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
        if next_run <= datetime.now():
            if new_schedule.frequency == "Daily":
                next_run += timedelta(days=1)
            elif new_schedule.frequency == "Weekly":
                next_run += timedelta(weeks=1)
            elif new_schedule.frequency == "Monthly":
                next_run += timedelta(days=30)
        new_schedule.next_run_at = next_run
    except:
        new_schedule.next_run_at = datetime.now() + timedelta(days=1)
    
    db.add(new_schedule)
    await db.commit()
    await db.refresh(new_schedule)
    
    return new_schedule

@router.delete("/schedules/{schedule_id}")
async def delete_report_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ReportSchedule).where(ReportSchedule.id == schedule_id, ReportSchedule.user_id == current_user.id)
    )
    schedule = result.scalars().first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    await db.delete(schedule)
    await db.commit()
    return {"message": "Schedule deleted successfully"}

@router.post("/{report_id}/retry")
async def retry_report(
    report_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = "Processing"
    report.error_message = None
    await db.commit()
    
    background_tasks.add_task(background_generate_report, report.id, current_user.id)
    
    return {"message": "Report retry initiated", "status": report.status, "task_id": report.id}

@router.delete("/{report_id}")
async def delete_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted successfully"}

@router.post("/{report_id}/email-executives")
async def email_report_to_executives(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == current_user.id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status != "Completed":
        raise HTTPException(status_code=400, detail="Only completed reports can be emailed")
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return {"message": "Email delivery simulated (SMTP credentials not set in .env)", "simulated": True}

    temp_dir = tempfile.gettempdir()
    report_path = os.path.join(temp_dir, report.url)
    
    from app.utils.email import send_report_email
    
    report.email_status = "Processing"
    await db.commit()

    success = send_report_email(
        recipient_emails=current_user.email, 
        report_path=report_path,
        report_name=report.name
    )
    
    if success:
        report.email_status = "Sent"
        report.email_delivered_at = datetime.now()
        report.recipient_emails = current_user.email
        await db.commit()
        return {"message": f"Report successfully delivered to {current_user.email}"}
    else:
        report.email_status = "Failed"
        report.delivery_error = "SMTP delivery failed (check logs/credentials)"
        await db.commit()
        raise HTTPException(status_code=500, detail="Failed to send executive email. Please verify SMTP settings in backend .env")

@router.post("/companies/{company_id}/report")
async def initiate_company_report(
    company_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.user_id == current_user.id)
    )
    company = result.scalars().first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    new_report = Report(
        user_id=current_user.id,
        company_id=company.id,
        name=f"Company Audit: {company.name}",
        status="Processing",
        type="Company",
        format="PDF",
        size="Processing..."
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    background_tasks.add_task(background_generate_report, new_report.id, current_user.id)
    
    return {
        "id": new_report.id,
        "task_id": new_report.id,
        "message": "Company report generation initiated",
        "status": new_report.status
    }
