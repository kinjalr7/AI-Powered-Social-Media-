from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, default="Global") # Global, Company
    frequency = Column(String, default="Weekly") # Daily, Weekly, Monthly
    time = Column(String, default="09:00") # HH:MM format
    recipient_emails = Column(String, nullable=True) # Comma-separated emails (e.g. "ceo@gmail.com, hr@gmail.com")
    is_active = Column(Boolean, default=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
