"""Watchlist Router."""

from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter
from ..models import WatchlistItem
from ..store import store

router = APIRouter(prefix="/api/watchlist", tags=["Watchlist"])


class WatchlistAddPayload(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    notes: Optional[str] = None


@router.get("", response_model=list[WatchlistItem])
async def get_watchlist_endpoint():
    """Retrieve saved user watchlists."""
    return store.get_watchlist()


@router.post("", response_model=WatchlistItem)
async def add_watchlist_endpoint(payload: WatchlistAddPayload):
    """Add a ticker to the active watchlist."""
    return store.add_to_watchlist(
        ticker=payload.ticker,
        name=payload.company_name or payload.ticker,
        notes=payload.notes,
    )


@router.delete("/{ticker}")
async def remove_watchlist_endpoint(ticker: str):
    """Remove a ticker from the active watchlist."""
    success = store.remove_from_watchlist(ticker)
    return {"status": "success", "removed": success}
