from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import User
from app.models.user_settings import UserSettings
from app.schemas.user_settings import UserSettingsRead, UserSettingsUpdate
from app.core.security import get_current_user

router = APIRouter()

@router.get("/", response_model=UserSettingsRead)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user settings.
    """
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = result.scalars().first()
    
    if not settings:
        # Create default settings if they don't exist
        settings = UserSettings(
            user_id=current_user.id,
            full_name=current_user.email.split('@')[0],
            company="AIGravity Systems",
            role="Analyst"
        )
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    return settings

@router.patch("/", response_model=UserSettingsRead)
async def update_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user settings.
    """
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    settings = result.scalars().first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    await db.commit()
    await db.refresh(settings)
    return settings
