"""Fundamental Screener Router — Multi-variable screening & ratios."""

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query
from ..models import FinancialMetrics, ScreenerResultItem
from ..services.screener_service import get_financial_metrics, run_stock_screener

router = APIRouter(prefix="/api/screener", tags=["Screener & Metrics"])


class ScreenerRunPayload(BaseModel):
    filters: list[str] = []
    limit: int = 25


@router.get("/metrics/{ticker}", response_model=FinancialMetrics)
async def metrics_endpoint(
    ticker: str,
    period: str = Query("annual", pattern="^(annual|quarterly)$"),
):
    """Retrieve fundamental ratios (PE, PS, PB, ROE, Margins) for a single ticker."""
    metrics = await get_financial_metrics(ticker=ticker, period=period)
    if not metrics:
        raise HTTPException(status_code=404, detail=f"Metrics for {ticker} not found or provider unconfigured.")
    return metrics


@router.post("/run", response_model=list[ScreenerResultItem])
async def screener_run_endpoint(payload: ScreenerRunPayload):
    """Execute multi-variable screening across public companies."""
    return await run_stock_screener(filters=payload.filters, limit=payload.limit)
