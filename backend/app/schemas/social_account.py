from typing import Optional
from pydantic import BaseModel, ConfigDict

class SocialAccountBase(BaseModel):
    platform: str
    company_id: int

class SocialAccountCreate(SocialAccountBase):
    access_token: str
    refresh_token: Optional[str] = None

class SocialAccountRead(SocialAccountBase):
    id: int
    refresh_token: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SocialAccountConnect(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
