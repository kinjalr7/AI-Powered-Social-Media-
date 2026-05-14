from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
import logging
import uuid
import random
from typing import Optional

from app.db.session import get_db
from app.models.report import Report
from app.models.company import Company
from app.models.user import User
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.routers.reports import background_generate_report
from app.core.config import settings

router = APIRouter(prefix="/automation", tags=["automation"])
logger = logging.getLogger(__name__)

async def verify_n8n_key(x_n8n_api_key: Optional[str] = Header(None)):
    if x_n8n_api_key != settings.N8N_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing n8n API Key"
        )
    return x_n8n_api_key

@router.post("/reports/daily")
async def trigger_daily_report(
    background_tasks: BackgroundTasks,
    company_id: int = None,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """
    Trigger a daily report generation for n8n.
    """
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        res = await db.execute(select(User).limit(1))
        user = res.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="No users found")
        user_id = user.id

    report_name = f"Daily Automated Report - {datetime.now().strftime('%Y-%m-%d')}"
    report_type = "Global"
    
    if company_id:
        res = await db.execute(select(Company).where(Company.id == company_id))
        company = res.scalars().first()
        if company:
            report_name = f"Daily Audit: {company.name}"
            report_type = "Company"

    new_report = Report(
        user_id=user_id,
        company_id=company_id,
        name=report_name,
        status="Processing",
        type=report_type,
        format="PDF",
        size="Processing...",
        recipient_emails="ceo@company.com, hr@company.com" # Default recipients for n8n
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    background_tasks.add_task(background_generate_report, new_report.id, user_id)
    
    return {
        "report_id": new_report.id,
        "status": "initiated",
        "name": new_report.name,
        "recipients": new_report.recipient_emails,
        "check_status_url": f"{settings.BASE_URL}{settings.API_V1_STR}/automation/reports/{new_report.id}"
    }

@router.get("/reports/{report_id}")
async def get_automation_report_status(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """Check report status for n8n."""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "id": report.id,
        "name": report.name,
        "status": report.status,
        "is_ready": report.status == "Completed",
        "download_url": f"{settings.BASE_URL}{settings.API_V1_STR}/automation/reports/{report.id}/download" if report.status == "Completed" else None,
        "recipients": report.recipient_emails,
        "error": report.error_message
    }


@router.get("/reports/{report_id}/download")
async def download_automation_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """Download report for n8n without user session."""
    from fastapi.responses import FileResponse
    import tempfile
    import os
    
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.status != "Completed" or not report.url:
        raise HTTPException(status_code=400, detail="Report not ready")

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, report.url)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing")
        
    return FileResponse(
        path=file_path,
        filename=f"{report.name.replace(' ', '_')}.pdf",
        media_type='application/pdf'
    )

@router.get("/posts/draft")

async def get_post_draft(
    company_id: int = 1,
    platform: str = "linkedin",
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """Generate a content draft for n8n to post."""
    drafts = [
        "Revolutionizing the way we think about AI Social Intelligence. 🚀",
        "Data-driven decisions are the backbone of modern marketing. 📊",
        "Stay ahead of the curve with our real-time sentiment analysis tools. 📈",
        "Automating your social media workflow has never been easier. 🤖"
    ]
    content = random.choice(drafts)
    
    return {
        "company_id": company_id,
        "platform": platform,
        "suggested_content": content,
        "hashtags": ["AI", "SocialIntelligence", "Automation"]
    }

@router.post("/posts/log")
async def log_post_result(
    request: Request,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """Log the result of an automated post from n8n and save to DB."""
    payload = await request.json()
    company_id = payload.get("company_id", 1)
    platform = payload.get("platform", "linkedin")
    content = payload.get("content")
    
    # Try to find a social account to link to
    account_res = await db.execute(
        select(SocialAccount).where(
            SocialAccount.company_id == company_id,
            SocialAccount.platform == platform
        )
    )
    account = account_res.scalars().first()
    
    if account and content:
        new_post = Post(
            social_id=account.id,
            content=content,
            sentiment="Neutral",
            likes=0
        )
        db.add(new_post)
        await db.commit()
        logger.info(f"n8n post saved to DB: {content[:50]}...")
    
    return {"status": "success", "logged": True}

@router.post("/reports/{report_id}/status-update")
async def update_report_status_from_n8n(
    report_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    api_key: str = Depends(verify_n8n_key)
):
    """Update report delivery status from n8n."""
    payload = await request.json()
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if "email_sent" in payload:
        report.email_status = "Sent" if payload["email_sent"] else "Failed"
        if payload["email_sent"]:
            report.email_delivered_at = datetime.now()
        else:
            report.delivery_error = payload.get("error", "Unknown SMTP error")
            # If email fails, we might want to mark the report as partially failed or just log it
            logger.warning(f"Report {report_id} email delivery failed: {report.delivery_error}")
    
    if "status" in payload:
        # Allow n8n to override report status (e.g., if n8n detects a timeout or generation failure)
        report.status = payload["status"]
        if "error" in payload:
            report.error_message = payload["error"]

    await db.commit()
    logger.info(f"Report {report_id} updated by n8n. Email Status: {report.email_status}, Report Status: {report.status}")
    return {"status": "updated", "report_id": report_id}
