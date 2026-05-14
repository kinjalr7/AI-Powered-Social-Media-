
import asyncio
from app.db.database import engine, Base
from app.models.user import User
from app.models.company import Company
from app.models.report import Report
from app.models.schedule import ReportSchedule
from app.models.analysis import Analysis
from app.models.post import Post

async def create_tables():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully")

if __name__ == "__main__":
    asyncio.run(create_tables())
