"""Stock Screener & Metrics Router."""

from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Query, Header
from ..models import FinancialMetrics, ScreenerResultItem
from ..services.screener_service import get_financial_metrics, run_stock_screener

router = APIRouter(prefix="/api/screener", tags=["Stock Screener"])


class ScreenerPayload(BaseModel):
    filters: list[str] = []
    limit: int = 25


@router.get("/metrics/{ticker}", response_model=FinancialMetrics)
async def metrics_endpoint(
    ticker: str,
    period: str = Query("annual", pattern="^(annual|quarterly)$"),
    x_api_key: Optional[str] = Header(None, alias="x-api-key"),
    x_treg_token: Optional[str] = Header(None, alias="x-treg-token"),
):
    """Retrieve fundamental ratios (PE, PS, PB, ROE, Margins) for a single ticker."""
    metrics = await get_financial_metrics(ticker=ticker, period=period, api_key=x_api_key, treg_token=x_treg_token)
    if not metrics:
        raise HTTPException(status_code=404, detail=f"Metrics for {ticker} not found or provider unconfigured.")
    return metrics


@router.post("/run", response_model=list[ScreenerResultItem])
async def run_screener_endpoint(
    payload: ScreenerPayload,
    x_api_key: Optional[str] = Header(None, alias="x-api-key"),
    x_treg_token: Optional[str] = Header(None, alias="x-treg-token"),
):
    """Execute multi-variable screening across public companies using 'field:operator:value' filters."""
    return await run_stock_screener(
        filters=payload.filters,
        limit=payload.limit,
        api_key=x_api_key,
        treg_token=x_treg_token,
    )
