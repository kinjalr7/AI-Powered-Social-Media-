from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    engagement_score = Column(Float, default=0.0)
    hiring_signals = Column(String, nullable=True) # Could be JSON or comma-separated string

    company = relationship("Company", back_populates="analyses")
