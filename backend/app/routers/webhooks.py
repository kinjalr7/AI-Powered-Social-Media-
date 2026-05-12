from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.company import Company
from sqlalchemy.future import select

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/ingest/{company_id}")
async def n8n_ingest_webhook(
    company_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook endpoint for n8n to push data for a specific company.
    """
    # Verify company exists
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Get the payload from n8n
    payload = await request.json()
    
    # TODO: Process the payload (e.g., save posts, update analytics)
    # For now, just return success
    return {
        "status": "success",
        "message": f"Data received for company {company_id}",
        "data_points": len(payload) if isinstance(payload, list) else 1
    }
