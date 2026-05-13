from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from app.models.social_account import SocialAccount

async def validate_token(token: str, platform: str) -> bool:
    """
    Validate a social media access token.
    Currently a stub that returns True for non-empty tokens.
    """
    if not token:
        return False
    # In a real implementation, you would call the platform's API (e.g., LinkedIn, Twitter)
    # to verify if the token is valid and active.
    return True

async def connect_social_account(
    db: AsyncSession, 
    company_id: int, 
    platform: str, 
    access_token: str, 
    refresh_token: Optional[str] = None
) -> SocialAccount:
    """
    Store social media tokens for a company.
    If an account for this platform already exists for the company, it updates it.
    """
    # Check if existing
    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.company_id == company_id,
            SocialAccount.platform == platform
        )
    )
    db_account = result.scalars().first()
    
    if db_account:
        db_account.access_token = access_token
        db_account.refresh_token = refresh_token
    else:
        db_account = SocialAccount(
            company_id=company_id,
            platform=platform,
            access_token=access_token,
            refresh_token=refresh_token
        )
        db.add(db_account)
    
    await db.commit()
    await db.refresh(db_account)
    return db_account

async def delete_social_account(db: AsyncSession, account_id: int) -> bool:
    """
    Remove a social media account from the database.
    """
    result = await db.execute(select(SocialAccount).where(SocialAccount.id == account_id))
    db_account = result.scalars().first()
    if db_account:
        await db.delete(db_account)
        await db.commit()
        return True
    return False
