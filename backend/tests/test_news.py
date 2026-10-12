"""
Automated unit & integration tests for Gaming News Portal.
"""

from httpx import AsyncClient
import pytest


@pytest.mark.asyncio
async def test_get_news_feed(client: AsyncClient):
    """Test fetching gaming news articles with default seeding."""
    res = await client.get("/api/v1/news")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    articles = data["data"]
    assert len(articles) >= 1
    assert "title" in articles[0]
    assert "game" in articles[0]


@pytest.mark.asyncio
async def test_filter_news_by_game(client: AsyncClient):
    """Test filtering news articles by game name."""
    res = await client.get("/api/v1/news?game=VALORANT")
    assert res.status_code == 200
    articles = res.json()["data"]
    assert all("valorant" in a["game"].lower() for a in articles)


@pytest.mark.asyncio
async def test_filter_news_by_category(client: AsyncClient):
    """Test filtering news articles by category."""
    res = await client.get("/api/v1/news?category=Patch Notes")
    assert res.status_code == 200
    articles = res.json()["data"]
    assert len(articles) >= 1
    assert all("patch" in a["category"].lower() for a in articles)


@pytest.mark.asyncio
async def test_create_news_unauthorized(client: AsyncClient):
    """Test POST /api/v1/news requires admin authentication."""
    payload = {
        "title": "Unauthorized Article",
        "summary": "Should be rejected without admin auth.",
        "content": "Test content",
        "game": "VALORANT",
        "category": "Esports",
    }
    res = await client.post("/api/v1/news", json=payload)
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_create_news_article_admin(client: AsyncClient):
    """Test admin publishing a new esports article."""
    import uuid
    from app.core.dependencies import get_current_admin_user, get_current_user
    from app.main import app
    from app.models.user import User

    admin_user = User(
        id=uuid.uuid4(),
        username="news_admin",
        email="newsadmin@squadsync.gg",
        password_hash="mock_hash",
        is_active=True,
        is_admin=True,
    )
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_current_admin_user] = lambda: admin_user

    try:
        payload = {
            "title": "VCT Masters Tokyo 2026 Grand Final",
            "summary": "Full match telemetry and analysis from the grand final.",
            "content": "In-depth agent pick rates and tactical map breakdowns.",
            "game": "VALORANT",
            "category": "Esports",
            "source_url": "https://vct.gg/masters-tokyo-2026",
            "image_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
        }
        res = await client.post("/api/v1/news", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert data["success"] is True
        assert data["data"]["title"] == "VCT Masters Tokyo 2026 Grand Final"
        assert data["data"]["game"] == "VALORANT"
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_current_admin_user, None)
