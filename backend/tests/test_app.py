import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import MagicMock, AsyncMock
from app.main import app
from app.core.config import settings
from app.db.session import get_db

# Mock DB session
async def override_get_db():
    mock_db = AsyncMock()
    # By default, mock_db.execute returns an object with scalars().first() == None
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result
    yield mock_db

app.dependency_overrides[get_db] = override_get_db

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to AI Social Intelligence Platform API"}

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_copilot_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"prompt": "Hello Copilot"}
        response = await ac.post(f"{settings.API_V1_STR}/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "Hello Copilot" in data["answer"]
    assert data["model"] == "openrouter/stub"

@pytest.mark.asyncio
async def test_webhooks_ingest_company_not_found():
    # Dependency override is active, so it will return 404 since mock company is None
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/webhooks/ingest/9999", json={"data": "test"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Company not found"

@pytest.mark.asyncio
async def test_webhooks_ingest_success():
    # Temporarily override mock to return a company
    mock_company = MagicMock()
    mock_company.id = 1
    
    async def override_get_db_success():
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = mock_company
        mock_db.execute.return_value = mock_result
        yield mock_db
    
    app.dependency_overrides[get_db] = override_get_db_success
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/webhooks/ingest/1", json={"data": "test"})
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Restore default mock
    app.dependency_overrides[get_db] = override_get_db

@pytest.mark.asyncio
async def test_auth_login_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"username": "nonexistent@example.com", "password": "password123"}
        response = await ac.post(f"{settings.API_V1_STR}/auth/login", data=payload)
    # Since DB returns None, user won't be found
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_get_companies_unauthorized():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/companies/")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"

@pytest.mark.asyncio
async def test_auth_register_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"email": "invalid-email", "password": "123"}
        response = await ac.post(f"{settings.API_V1_STR}/auth/register", json=payload)
    assert response.status_code == 422
