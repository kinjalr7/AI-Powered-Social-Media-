import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app
from app.core.config import settings
from app.db.session import get_db
from app.core.security import get_password_hash, create_access_token

# Mock data
MOCK_USER = MagicMock()
MOCK_USER.id = 1
MOCK_USER.email = "test@example.com"
MOCK_USER.hashed_password = get_password_hash("password123")
MOCK_USER.is_active = True

@pytest.mark.asyncio
async def test_register_success():
    async def override_get_db():
        mock_db = AsyncMock()
        # Mocking check for existing user (returns None)
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        mock_db.execute.return_value = mock_result
        
        async def mock_refresh(obj):
            obj.id = 1
        
        mock_db.refresh = mock_refresh
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"email": "new@example.com", "password": "password123"}
        response = await ac.post(f"{settings.API_V1_STR}/auth/register", json=payload)
    
    assert response.status_code == 200
    assert response.json()["email"] == "new@example.com"
    assert response.json()["id"] == 1
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_register_existing_email():
    async def override_get_db():
        mock_db = AsyncMock()
        # Mocking check for existing user (returns a user)
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = MOCK_USER
        mock_db.execute.return_value = mock_result
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"email": "test@example.com", "password": "password123"}
        response = await ac.post(f"{settings.API_V1_STR}/auth/register", json=payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_login_success():
    async def override_get_db():
        mock_db = AsyncMock()
        # Mocking user fetch
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = MOCK_USER
        mock_db.execute.return_value = mock_result
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"username": "test@example.com", "password": "password123"}
        response = await ac.post(f"{settings.API_V1_STR}/auth/login", data=payload)
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_me_success():
    token = create_access_token(subject=MOCK_USER.email)
    
    async def override_get_db():
        mock_db = AsyncMock()
        # Mocking user fetch for get_current_user
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = MOCK_USER
        mock_db.execute.return_value = mock_result
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        headers = {"Authorization": f"Bearer {token}"}
        response = await ac.get(f"{settings.API_V1_STR}/auth/me", headers=headers)
    
    assert response.status_code == 200
    assert response.json()["email"] == MOCK_USER.email
    app.dependency_overrides.clear()
