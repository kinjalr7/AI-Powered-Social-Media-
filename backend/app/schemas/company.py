from pydantic import BaseModel, ConfigDict

class CompanyBase(BaseModel):
    name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyRead(CompanyBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class CompanyUpdate(BaseModel):
    name: str | None = None
