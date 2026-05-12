# Project Constitution: AI Social Intelligence Platform

## Goal
Build a production-grade web app that helps companies connect social accounts, ingest posts and engagement, analyze trends, generate reports, and provide AI insights.

## Tech Stack
- **Backend**: FastAPI
- **ORM/Database**: SQLAlchemy (SQLite for dev, PostgreSQL for production)
- **Validation**: Pydantic
- **Scheduling**: APScheduler
- **PDF Reports**: ReportLab
- **Auth**: JWT + Password Hashing
- **AI**: Transformers (first), LLM/RAG (later)
- **Automation**: n8n (later)

## Hard Rules
1. **No hardcoded production data**: All modules must read exclusively from the database source of truth. No fake demo data fallbacks.
2. **No fake APIs**: Do not invent unsupported integrations.
3. **Backend First**: Build backend logic completely before frontend.
4. **Service Layer**: Keep business logic in `services/`, NOT in route handlers/controllers.
5. **Testability**: Every feature must be modular and testable.

## Build Order
1. Project constitution / rules (Current)
2. Folder structure (Current)
3. Config and environment setup
4. Database and models
5. Auth
6. Social account connection
7. Data ingestion
8. Dashboard and analytics
9. Report generation and email
10. AI copilot
11. n8n workflows
