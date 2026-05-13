from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from app.schemas.user_settings import UserSettingsRead

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    settings: Optional[UserSettingsRead] = None
    model_config = ConfigDict(from_attributes=True)
