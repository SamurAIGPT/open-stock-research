"""Company Research Router — Profile, Quote, Financial Statements, SEC Filings."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ..models import CompanyProfile, StockQuote, FinancialStatement, SecFiling
from ..services.company_service import (
    get_company_profile,
    get_stock_quote,
    get_financial_statements,
    get_sec_filings,
)

router = APIRouter(prefix="/api/company", tags=["Company Research"])


@router.get("/profile/{ticker}", response_model=CompanyProfile)
async def company_profile_endpoint(ticker: str):
    """Retrieve company metadata, sector, industry, and description."""
    profile = await get_company_profile(ticker)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile for {ticker} not found or provider unconfigured.")
    return profile


@router.get("/quote/{ticker}", response_model=StockQuote)
async def stock_quote_endpoint(ticker: str):
    """Retrieve real-time / current market price quote for a ticker."""
    quote = await get_stock_quote(ticker)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Quote for {ticker} not found or provider unconfigured.")
    return quote


@router.get("/financials/{ticker}", response_model=list[FinancialStatement])
async def financial_statements_endpoint(
    ticker: str,
    statement_type: str = Query("income", pattern="^(income|balance|cash_flow)$"),
    period: str = Query("annual", pattern="^(annual|quarterly)$"),
    limit: int = Query(5, ge=1, le=20),
):
    """Retrieve standardized income statements, balance sheets, or cash flow statements."""
    return await get_financial_statements(
        ticker=ticker,
        statement_type=statement_type,
        period=period,
        limit=limit,
    )


@router.get("/filings/{ticker}", response_model=list[SecFiling])
async def sec_filings_endpoint(
    ticker: str,
    limit: int = Query(15, ge=1, le=50),
):
    """Retrieve official SEC filing records (10-K, 10-Q, 8-K) with EDGAR links."""
    return await get_sec_filings(ticker=ticker, limit=limit)
