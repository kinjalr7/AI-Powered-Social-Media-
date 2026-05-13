from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    
    # Profile
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    
    # Preferences
    theme = Column(String, default="dark")
    timezone = Column(String, default="UTC")
    locale = Column(String, default="en-US")
    
    # Toggles
    notifications_enabled = Column(Boolean, default=True)
    email_reports_enabled = Column(Boolean, default=True)
    
    # JSON for flexible connected account preferences
    connected_accounts_prefs = Column(JSON, default={})

    user = relationship("User", back_populates="settings")
