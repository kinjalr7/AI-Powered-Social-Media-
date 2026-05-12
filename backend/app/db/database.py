from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

from sqlalchemy.pool import NullPool

# If DATABASE_URL is not set in .env, fallback to constructing it
if settings.DATABASE_URL:
    db_url = settings.DATABASE_URL
else:
    db_url = f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

engine_kwargs = {
    "echo": True,
    "future": True
}

if "sqlite" in db_url:
    engine_kwargs["poolclass"] = NullPool

engine = create_async_engine(
    db_url,
    **engine_kwargs
)

Base = declarative_base()

# SessionLocal and get_db moved to session.py
