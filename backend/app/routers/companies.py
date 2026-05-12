from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate
from app.core.security import get_current_user
from app.services import company as company_service

router = APIRouter(
    prefix="/companies",
    tags=["companies"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[CompanyRead])
async def get_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve companies for the current user.
    """
    return await company_service.get_companies(db, user_id=current_user.id)

@router.post("/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_in: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new company for the current user.
    """
    return await company_service.create_company(db, company_in=company_in, user_id=current_user.id)

@router.get("/{company_id}", response_model=CompanyRead)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific company by ID.
    """
    db_company = await company_service.get_company(db, company_id=company_id, user_id=current_user.id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.put("/{company_id}", response_model=CompanyRead)
async def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a company.
    """
    db_company = await company_service.get_company(db, company_id=company_id, user_id=current_user.id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    return await company_service.update_company(db, db_company=db_company, company_in=company_in)

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a company.
    """
    db_company = await company_service.get_company(db, company_id=company_id, user_id=current_user.id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    await company_service.delete_company(db, db_company=db_company)
    return None
