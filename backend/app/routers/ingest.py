from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.company import Company
from app.models.social_account import SocialAccount
from app.models.user import User
from app.core.security import get_current_user
from app.services.ingest import fetch_posts
from app.schemas.post import PostRead

router = APIRouter()

@router.post("/companies/{company_id}/ingest/{platform}", response_model=List[PostRead])
async def ingest_platform_posts(
    company_id: int,
    platform: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Trigger data ingestion for a specific company and platform.
    Requires a connected social account for that platform.
    """
    # 1. Verify company exists and belongs to user
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.user_id == current_user.id)
    )
    company = result.scalars().first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Company not found or access denied"
        )
    
    # 2. Find the social account for this platform
    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.company_id == company_id,
            SocialAccount.platform == platform
        )
    )
    social_account = result.scalars().first()
    if not social_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"No {platform} account connected for this company. Please connect first."
        )
    
    # 3. Call ingest service
    # The service will use httpx to fetch data and save it to the DB
    posts = await fetch_posts(
        db=db,
        platform=platform,
        token=social_account.access_token,
        social_id=social_account.id
    )
    
    # 4. Notify connected clients via WebSocket
    from app.core.websocket_manager import manager
    if posts:
        # Broadcast the latest post to the dashboard
        latest_post = posts[0]
        await manager.broadcast_to_user(current_user.id, {
            "type": "NEW_POST",
            "data": {
                "id": latest_post.id,
                "platform": platform.capitalize(),
                "content": latest_post.content,
                "likes": f"{latest_post.likes:,}",
                "comments": latest_post.likes // 10,
                "time": "Just now"
            }
        })
        
        # Also broadcast updated KPIs
        # This is a bit simplified, but demonstrates the live update
        await manager.broadcast_to_user(current_user.id, {
            "type": "UPDATE_KPI",
            "data": { "title": "Total Engagement", "value": "Refreshed", "trend": 0.5 }
        })
    
    return posts
