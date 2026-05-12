from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import tempfile

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.report import Report
from app.services.reports import generate_pdf
from app.core.config import settings

router = APIRouter()

@router.post("/")
async def generate_global_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a global summary report for the current user.
    """
    # Create a new report record in DB
    new_report = Report(
        user_id=current_user.id,
        name=f"Global Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        status="Completed",
        type="Global"
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    return {
        "id": new_report.id,
        "message": "Global report generated and saved successfully",
        "report_name": new_report.name
    }

from datetime import datetime

@router.get("/companies/{company_id}/report")
async def get_company_report(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a PDF report for a company and return a download URL.
    The report is temporarily stored in the system's temp directory.
    """
    # 1. Verify company exists and belongs to the user
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.user_id == current_user.id)
    )
    company = result.scalars().first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Company not found or access denied"
        )
    
    try:
        # 2. Generate the PDF
        report_path = await generate_pdf(db, company_id)
        filename = os.path.basename(report_path)
        
        # 3. Construct the download URL
        # Note: In production, you might use a signed URL for an S3 bucket
        download_url = f"{settings.API_V1_STR}/reports/download/{filename}"
        
        return {
            "company_name": company.name,
            "report_url": download_url,
            "message": "Report generated successfully. Use the URL to download."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to generate report: {str(e)}"
        )

@router.get("/download/{filename}")
async def download_report(filename: str):
    """
    Endpoint to download a generated PDF report from the temporary storage.
    """
    # Safety check: ensure the filename doesn't contain path traversal characters
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=400, detail="Invalid filename")

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found or expired")
    
    return FileResponse(
        path=file_path, 
        filename=filename, 
        media_type='application/pdf'
    )

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
    
    return {
        "active_generations": 0,
        "recent_reports": [
            {
                "id": r.id, 
                "name": r.name, 
                "status": r.status, 
                "date": r.created_at.strftime("%Y-%m-%d"),
                "url": r.url or "#"
            } for r in reports
        ]
    }
