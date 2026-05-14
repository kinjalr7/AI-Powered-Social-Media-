from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Social Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "ai_social_db"
    POSTGRES_PORT: str = "5432"
    DATABASE_URL: Optional[str] = None

    # Email Settings (Gmail SMTP default)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_USER: Optional[str] = None # Set in .env
    SMTP_PASSWORD: Optional[str] = None # Set in .env
    EMAILS_FROM_EMAIL: Optional[str] = "noreply@ai-social-intelligence.com"
    EMAILS_FROM_NAME: Optional[str] = "AI Social Intelligence Platform"
    # n8n Automation
    N8N_API_KEY: str = "n8n_secret_token_2026" # Default for local dev
    BASE_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development" # "development" or "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
