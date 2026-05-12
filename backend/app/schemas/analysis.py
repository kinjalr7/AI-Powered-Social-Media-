from typing import Optional
from pydantic import BaseModel, ConfigDict

class AnalysisBase(BaseModel):
    company_id: int

class AnalysisCreate(AnalysisBase):
    engagement_score: Optional[float] = 0.0
    hiring_signals: Optional[str] = None

class AnalysisRead(AnalysisBase):
    id: int
    engagement_score: float
    hiring_signals: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
