"""Stock History Router — Daily OHLCV Price Bars."""

from typing import Optional
from fastapi import APIRouter, Query
from ..models import StockHistoryResponse
from ..services.history_service import get_stock_price_history

router = APIRouter(prefix="/api/history", tags=["Market History"])


@router.get("/{ticker}", response_model=StockHistoryResponse)
async def stock_history_endpoint(
    ticker: str,
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(60, ge=5, le=365),
):
    """Retrieve daily end-of-day OHLCV bars for technical and price chart views."""
    return await get_stock_price_history(
        ticker=ticker,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
    )
