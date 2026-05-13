from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="Completed") # Pending, Completed, Failed, Processing
    type = Column(String, default="Global") # Global, Company, Competitor
    format = Column(String, default="PDF") # PDF, CSV
    size = Column(String, nullable=True) # e.g. "1.2 MB"
    url = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
