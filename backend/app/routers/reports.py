from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
import os
import tempfile
import uuid
import random
import asyncio

from app.db.session import SessionLocal, get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.report import Report
from app.services.reports import generate_pdf, generate_global_audit
from app.core.config import settings

router = APIRouter()

async def background_generate_report(report_id: int, user_id: int):
    """Actual generation logic running in background."""
    try:
        # We need a new session for background tasks
        async with SessionLocal() as db:
            # 1. Fetch report
            result = await db.execute(select(Report).where(Report.id == report_id))
            report = result.scalars().first()
            if not report:
                return

            # 2. Update status to Processing (redundant but safe)
            report.status = "Processing"
            await db.commit()

            # 3. Generate the actual PDF
            if report.type == "Global":
                report_path = await generate_global_audit(db, user_id)
            elif report.type == "Company" and report.company_id:
                report_path = await generate_pdf(db, report.company_id)
            else:
                report_path = await generate_global_audit(db, user_id)
            
            filename = os.path.basename(report_path)
            
            # 4. Finalize report record
            report.status = "Completed"
            report.size = f"{os.path.getsize(report_path) / 1024 / 1024:.1f} MB"
            report.url = f"{settings.API_V1_STR}/reports/download/{filename}"
            report.error_message = None
            await db.commit()
    except Exception as e:
        async with SessionLocal() as db:
            result = await db.execute(select(Report).where(Report.id == report_id))
            report = result.scalars().first()
            if report:
                report.status = "Failed"
                report.error_message = str(e)
                await db.commit()

@router.post("/")
async def generate_global_report(
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
        "message": "Report generation initiated in background",
        "status": new_report.status,
        "report_name": new_report.name
    }

@router.get("/status")
async def get_reports_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status of recent report generations.
    """
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
    
    # Also add some "Scheduled" info for the UI
    scheduled = [
        {"id": "sch_1", "name": "Weekly Performance Snapshot", "next_run": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "frequency": "Weekly"},
        {"id": "sch_2", "name": "Monthly Stakeholder Review", "next_run": "2026-06-01", "frequency": "Monthly"}
    ]
    
    return {
        "active_generations": sum(1 for r in reports if r.status in ["Pending", "Processing"]),
        "recent_reports": [
            {
                "id": r.id, 
                "name": r.name, 
                "status": r.status, 
                "date": r.created_at.strftime("%Y-%m-%d"),
                "type": r.type,
                "format": r.format,
                "size": r.size,
                "url": r.url or "#",
                "error_message": r.error_message
            } for r in reports
        ],
        "scheduled_reports": scheduled
    }

@router.get("/{report_id}")
async def get_report_details(
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
    
    return report

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
    
    # Re-trigger background task
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

@router.post("/companies/{company_id}/report")
async def initiate_company_report(
    company_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Initiate a background report generation for a specific company.
    """
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
        "status": new_report.status,
        "company_name": company.name
    }

@router.get("/download/{filename}")
async def download_report_file(filename: str):
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    
    return FileResponse(path=file_path, filename=filename, media_type='application/pdf')
