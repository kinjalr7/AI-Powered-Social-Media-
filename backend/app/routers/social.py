from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services import social as social_service
from app.services import company as company_service
from app.schemas.social_account import SocialAccountRead, SocialAccountConnect

from app.models.social_account import SocialAccount
from app.models.company import Company
from sqlalchemy.future import select

router = APIRouter(
    tags=["social"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/accounts")
async def get_connected_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all connected social accounts for the user's companies.
    """
    result = await db.execute(
        select(SocialAccount, Company.name)
        .join(Company)
        .where(Company.user_id == current_user.id)
    )
    rows = result.all()
    
    platforms = [
        {
            "id": row[0].id,
            "platform": row[0].platform,
            "company_id": row[0].company_id,
            "company_name": row[1],
            "status": "Connected",
            "account": f"@{row[1].lower().replace(' ', '')}_{row[0].platform[:2]}", # Mocked account name
            "posts": len(row[0].posts) if hasattr(row[0], "posts") and row[0].posts else 0, # Note: this will need posts relationship loaded or handled differently, better to just mock the count for now.
            "lastSync": "Just now",
            "icon": row[0].platform[:2].upper()
        }
        for row in rows
    ]
    
    return platforms

@router.post("/companies/{company_id}/connect/{platform}", response_model=SocialAccountRead)
async def connect_platform(
    company_id: int,
    platform: str,
    token_data: SocialAccountConnect,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    OAuth flow stub: Store tokens for a specific platform and company.
    Platforms: linkedin, twitter.
    """
    if platform not in ["linkedin", "twitter"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Unsupported platform: {platform}. Supported platforms: linkedin, twitter."
        )
    
    # Verify company exists and belongs to the user
    db_company = await company_service.get_company(db, company_id=company_id, user_id=current_user.id)
    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Company not found or access denied"
        )
    
    # Validate token (stub)
    is_valid = await social_service.validate_token(token_data.access_token, platform)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid access token provided"
        )
    
    # Store/Update token in database
    return await social_service.connect_social_account(
        db, 
        company_id=company_id, 
        platform=platform, 
        access_token=token_data.access_token, 
        refresh_token=token_data.refresh_token
    )
