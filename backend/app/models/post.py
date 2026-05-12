from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    social_id = Column(Integer, ForeignKey("social_accounts.id"), nullable=False)
    content = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    sentiment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    social_account = relationship("SocialAccount", back_populates="posts")
