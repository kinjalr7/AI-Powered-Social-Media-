from fastapi import APIRouter
from app.routers import auth, companies, social, ingest, analytics, reports, webhooks, copilot, dashboard_api, charts, ws, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(companies.router)
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(ingest.router, tags=["ingest"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(webhooks.router)
api_router.include_router(copilot.router)
api_router.include_router(dashboard_api.router)
api_router.include_router(charts.router, prefix="/charts", tags=["charts"])
api_router.include_router(ws.router, tags=["websocket"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
