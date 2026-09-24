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
