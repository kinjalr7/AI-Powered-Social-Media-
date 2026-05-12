import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from sqlalchemy import select

async def check():
    async with SessionLocal() as db:
        result = await db.execute(select(User.email))
        email = result.scalars().first()
        print(f"FIRST_USER_EMAIL:{email}")

if __name__ == "__main__":
    asyncio.run(check())
