"""Data models for Open Stock Research.
Directly aligns with Muapi's public financial, market history, screener, and crypto schemas.
"""

from datetime import datetime, timezone
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# Company Profile & Quotes
class CompanyProfile(BaseModel):
    ticker: str
    name: str
    exchange: Optional[str] = "NASDAQ"
    sector: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = "US"
    currency: Optional[str] = "USD"
    market_cap: Optional[float] = None
    shares_outstanding: Optional[float] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    ceo: Optional[str] = None
    ipo_date: Optional[str] = None


class StockQuote(BaseModel):
    ticker: str
    current_price: float
    change: float = 0.0
    change_percent: float = 0.0
    high: Optional[float] = None
    low: Optional[float] = None
    open: Optional[float] = None
    previous_close: Optional[float] = None
    volume: Optional[int] = None
    currency: str = "USD"
    timestamp: str = Field(default_factory=now_utc_iso)


# Financial Statements
class FinancialStatement(BaseModel):
    ticker: str
    statement_type: Literal["income", "balance", "cash_flow"]
    period: Literal["annual", "quarterly"] = "annual"
    fiscal_year: Optional[int] = None
    fiscal_period: Optional[str] = None  # FY2025, Q3 2025
    filing_date: Optional[str] = None
    currency: str = "USD"
    line_items: dict[str, Any] = Field(default_factory=dict)


# SEC Filings
class SecFiling(BaseModel):
    ticker: str
    form_type: str  # 10-K, 10-Q, 8-K
    filing_date: str
    report_date: Optional[str] = None
    accession_number: Optional[str] = None
    edgar_url: Optional[str] = None
    description: Optional[str] = None


# Price History (EOD Bars)
class StockBar(BaseModel):
    date: str  # YYYY-MM-DD
    open: float
    high: float
    low: float
    close: float
    volume: int = 0
    adj_close: Optional[float] = None


class StockHistoryResponse(BaseModel):
    ticker: str
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    total_count: int
    bars: list[StockBar] = Field(default_factory=list)


# Fundamental Metrics & Screener
class FinancialMetrics(BaseModel):
    ticker: str
    pe_ratio: Optional[float] = None
    forward_pe: Optional[float] = None
    ps_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    operating_margin: Optional[float] = None  # percentage e.g. 28.5
    net_margin: Optional[float] = None  # percentage e.g. 21.0
    roe: Optional[float] = None  # percentage
    roa: Optional[float] = None
    debt_to_equity: Optional[float] = None
    free_cash_flow: Optional[float] = None
    dividend_yield: Optional[float] = None
    beta: Optional[float] = None


class ScreenerFilter(BaseModel):
    field: str
    operator: Literal["gt", "gte", "lt", "lte", "eq"]
    value: float


class ScreenerResultItem(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    price: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    operating_margin: Optional[float] = None
    roe: Optional[float] = None
    volume: Optional[int] = None


# Crypto Market Data (Read-only)
class CryptoMarketQuote(BaseModel):
    coin_id: str
    symbol: str
    name: str
    current_price_usd: float
    price_change_percentage_24h: float = 0.0
    market_cap_usd: Optional[float] = None
    total_volume_usd: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None
    sparkline_7d: list[float] = Field(default_factory=list)


# Sourced Research Brief
class ResearchBrief(BaseModel):
    ticker: str
    company_name: str
    overview: str
    financial_summary: str
    valuation_notes: str
    key_metrics: dict[str, Any] = Field(default_factory=dict)
    sec_filing_sources: list[SecFiling] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_utc_iso)


# Watchlist
class WatchlistItem(BaseModel):
    ticker: str
    company_name: str
    added_at: str = Field(default_factory=now_utc_iso)
    notes: Optional[str] = None
