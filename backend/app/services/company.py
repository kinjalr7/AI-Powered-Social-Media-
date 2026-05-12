from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate

async def get_companies(db: AsyncSession, user_id: int) -> List[Company]:
    result = await db.execute(select(Company).where(Company.user_id == user_id))
    return result.scalars().all()

async def get_company(db: AsyncSession, company_id: int, user_id: int) -> Optional[Company]:
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.user_id == user_id)
    )
    return result.scalars().first()

async def create_company(db: AsyncSession, company_in: CompanyCreate, user_id: int) -> Company:
    db_company = Company(
        name=company_in.name,
        user_id=user_id
    )
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)
    return db_company

async def update_company(
    db: AsyncSession, db_company: Company, company_in: CompanyUpdate
) -> Company:
    update_data = company_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)
    return db_company

async def delete_company(db: AsyncSession, db_company: Company) -> None:
    await db.delete(db_company)
    await db.commit()
