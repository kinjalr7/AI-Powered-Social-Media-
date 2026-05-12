from fastapi import APIRouter
from app.routers import auth, companies, social, ingest, analytics, reports, webhooks, copilot, dashboard_api, ws

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(companies.router)
api_router.include_router(social.router)
api_router.include_router(ingest.router, tags=["ingest"])
api_router.include_router(analytics.router, tags=["analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(webhooks.router)
api_router.include_router(copilot.router)
api_router.include_router(dashboard_api.router)
api_router.include_router(ws.router, tags=["websocket"])
