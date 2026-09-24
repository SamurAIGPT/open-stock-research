"""Unit and integration test suite for Open Stock Research."""

import pytest
from app.models import CompanyProfile, StockQuote, StockHistoryResponse, FinancialMetrics
from app.services.brief_service import generate_company_research_brief
from app.store import store


def test_watchlist_operations():
    # Test default seeding
    wl = store.get_watchlist()
    assert len(wl) >= 4
    assert any(item.ticker == "AAPL" for item in wl)

    # Add custom ticker
    item = store.add_to_watchlist("GOOGL", "Alphabet Inc.", "Search advertising & Cloud AI")
    assert item.ticker == "GOOGL"
    assert any(it.ticker == "GOOGL" for it in store.get_watchlist())

    # Remove custom ticker
    assert store.remove_from_watchlist("GOOGL") is True
    assert not any(it.ticker == "GOOGL" for it in store.get_watchlist())


def test_company_profile_model():
    p = CompanyProfile(
        ticker="AAPL",
        name="Apple Inc.",
        exchange="NASDAQ",
        sector="Technology",
        industry="Consumer Electronics",
        market_cap=3400000000000.0,
    )
    assert p.ticker == "AAPL"
    assert p.market_cap > 0


def test_stock_quote_model():
    q = StockQuote(
        ticker="MSFT",
        current_price=428.50,
        change=4.20,
        change_percent=0.99,
        volume=18500000,
    )
    assert q.ticker == "MSFT"
    assert q.current_price == 428.50


@pytest.mark.asyncio
async def test_research_brief_structure():
    # When unconfigured, generate_company_research_brief produces a clean brief with fallback company name
    brief = await generate_company_research_brief("NVDA")
    assert brief is not None
    assert brief.ticker == "NVDA"
    assert "NVDA" in brief.overview


def test_settings_endpoints():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.config import settings

    client = TestClient(app)

    # Test GET settings
    res = client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert "muapi_api_key" in data
    assert "treg_api_token" in data

    # Test POST settings
    test_key = "muapi_test_unit_key_123"
    post_res = client.post("/api/settings", json={"muapi_api_key": test_key})
    assert post_res.status_code == 200
    assert post_res.json()["has_muapi_key"] is True
    assert settings.muapi_api_key == test_key

    # Reset
    client.post("/api/settings", json={"muapi_api_key": ""})
    assert settings.muapi_api_key == ""
