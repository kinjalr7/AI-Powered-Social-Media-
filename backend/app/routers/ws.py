from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.core.websocket_manager import manager
from app.core.security import get_current_user_from_token
from app.models.user import User

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    try:
        user = await get_current_user_from_token(token)
        await manager.connect(user.id, websocket)
        try:
            while True:
                # Keep connection alive and wait for messages if any
                data = await websocket.receive_text()
                # We can handle client messages here if needed
        except WebSocketDisconnect:
            manager.disconnect(user.id, websocket)
    except Exception as e:
        # If authentication fails or other error
        await websocket.close(code=1008) # Policy Violation
