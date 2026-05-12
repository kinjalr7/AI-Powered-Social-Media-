from typing import Optional
from pydantic import BaseModel, ConfigDict

class PostBase(BaseModel):
    content: str
    social_id: int

class PostCreate(PostBase):
    likes: Optional[int] = 0
    sentiment: Optional[str] = None

class PostRead(PostBase):
    id: int
    likes: int
    sentiment: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
