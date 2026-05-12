from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    platform = Column(String, nullable=False)  # e.g., 'twitter', 'linkedin'
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)

    company = relationship("Company", back_populates="social_accounts")
    posts = relationship("Post", back_populates="social_account")
