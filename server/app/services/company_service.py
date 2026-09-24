"""Company research service — Profile, Real-time Quote, Standardized Statements, SEC Filings.
Consumes Muapi's code-complete `company-public-financials` endpoint (Finnhub & Financial Datasets).
"""

import httpx
from typing import Optional
from ..config import settings
from ..models import CompanyProfile, StockQuote, FinancialStatement, SecFiling


async def get_company_profile(ticker: str) -> Optional[CompanyProfile]:
    """Retrieve company metadata, sector, industry, and description via Muapi."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return None

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/company-public-financials"
                payload = {"mode": "profile", "ticker": t_clean}
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    raw = data.get("result") or data.get("profile") or data
                    return CompanyProfile(
                        ticker=t_clean,
                        name=raw.get("name") or raw.get("company_name") or t_clean,
                        exchange=raw.get("exchange") or "NASDAQ",
                        sector=raw.get("sector") or raw.get("finnhubIndustry"),
                        industry=raw.get("industry") or raw.get("finnhubIndustry"),
                        country=raw.get("country", "US"),
                        currency=raw.get("currency", "USD"),
                        market_cap=float(raw["market_capitalization"]) if raw.get("market_capitalization") else (float(raw["market_cap"]) if raw.get("market_cap") else None),
                        shares_outstanding=float(raw["shareOutstanding"]) if raw.get("shareOutstanding") else None,
                        website=raw.get("weburl") or raw.get("website"),
                        logo_url=raw.get("logo"),
                        description=raw.get("description"),
                        ceo=raw.get("ceo"),
                        ipo_date=raw.get("ipo"),
                    )
        except Exception:
            pass

    # Optional Treg direct pass-through
    if settings.treg_api_token:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": settings.treg_api_token}
                url = f"{settings.treg_base_url.rstrip('/')}/call/finnhub.company.profile"
                resp = await client.get(url, params={"symbol": t_clean}, headers=headers)
                if resp.status_code == 200:
                    raw = resp.json()
                    return CompanyProfile(
                        ticker=t_clean,
                        name=raw.get("name") or t_clean,
                        exchange=raw.get("exchange") or "NASDAQ",
                        sector=raw.get("finnhubIndustry"),
                        industry=raw.get("finnhubIndustry"),
                        country=raw.get("country", "US"),
                        currency=raw.get("currency", "USD"),
                        market_cap=float(raw["marketCapitalization"]) if raw.get("marketCapitalization") else None,
                        shares_outstanding=float(raw["shareOutstanding"]) if raw.get("shareOutstanding") else None,
                        website=raw.get("weburl"),
                        logo_url=raw.get("logo"),
                        ipo_date=raw.get("ipo"),
                    )
        except Exception:
            pass

    return None


async def get_stock_quote(ticker: str) -> Optional[StockQuote]:
    """Retrieve real-time / current market quote via Muapi or Treg."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return None

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/company-public-financials"
                payload = {"mode": "quote", "ticker": t_clean}
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    raw = data.get("result") or data.get("quote") or data
                    current = float(raw.get("current_price") or raw.get("c") or raw.get("price") or 0.0)
                    prev = float(raw.get("previous_close") or raw.get("pc") or current)
                    change = float(raw.get("change") or raw.get("d") or (current - prev))
                    pct = float(raw.get("change_percent") or raw.get("dp") or ((change / prev * 100) if prev else 0.0))
                    return StockQuote(
                        ticker=t_clean,
                        current_price=round(current, 2),
                        change=round(change, 2),
                        change_percent=round(pct, 2),
                        high=float(raw["h"]) if raw.get("h") else (float(raw["high"]) if raw.get("high") else None),
                        low=float(raw["l"]) if raw.get("l") else (float(raw["low"]) if raw.get("low") else None),
                        open=float(raw["o"]) if raw.get("o") else (float(raw["open"]) if raw.get("open") else None),
                        previous_close=prev,
                        volume=int(raw["volume"]) if raw.get("volume") else None,
                    )
        except Exception:
            pass

    if settings.treg_api_token:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": settings.treg_api_token}
                url = f"{settings.treg_base_url.rstrip('/')}/call/finnhub.quote"
                resp = await client.get(url, params={"symbol": t_clean}, headers=headers)
                if resp.status_code == 200:
                    raw = resp.json()
                    current = float(raw.get("c") or 0.0)
                    prev = float(raw.get("pc") or current)
                    change = float(raw.get("d") or (current - prev))
                    pct = float(raw.get("dp") or ((change / prev * 100) if prev else 0.0))
                    return StockQuote(
                        ticker=t_clean,
                        current_price=round(current, 2),
                        change=round(change, 2),
                        change_percent=round(pct, 2),
                        high=float(raw.get("h")) if raw.get("h") else None,
                        low=float(raw.get("l")) if raw.get("l") else None,
                        open=float(raw.get("o")) if raw.get("o") else None,
                        previous_close=prev,
                    )
        except Exception:
            pass

    return None


async def get_financial_statements(
    ticker: str,
    statement_type: str = "income",
    period: str = "annual",
    limit: int = 5,
) -> list[FinancialStatement]:
    """Retrieve standardized income statements, balance sheets, or cash flow reports."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return []

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/company-public-financials"
                payload = {
                    "mode": "financials",
                    "ticker": t_clean,
                    "statement_type": statement_type,
                    "period": period,
                    "limit": limit,
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("result") or data.get("financials") or data.get("statements") or []
                    if isinstance(items, dict) and "items" in items:
                        items = items["items"]
                    results = []
                    for st in items:
                        if isinstance(st, dict):
                            results.append(
                                FinancialStatement(
                                    ticker=t_clean,
                                    statement_type=statement_type,
                                    period=period,
                                    fiscal_year=st.get("fiscal_year") or st.get("year"),
                                    fiscal_period=st.get("fiscal_period") or st.get("period"),
                                    filing_date=st.get("filing_date") or st.get("date"),
                                    currency=st.get("currency", "USD"),
                                    line_items=st.get("line_items") or st,
                                )
                            )
                    if results:
                        return results
        except Exception:
            pass

    return []


async def get_sec_filings(ticker: str, limit: int = 15) -> list[SecFiling]:
    """Retrieve official SEC filing records (10-K, 10-Q, 8-K) with EDGAR links."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return []

    if settings.muapi_api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": settings.muapi_api_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/company-public-financials"
                payload = {"mode": "filings", "ticker": t_clean, "limit": limit}
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("result") or data.get("filings") or []
                    if isinstance(items, dict) and "items" in items:
                        items = items["items"]
                    results = []
                    for f in items:
                        if isinstance(f, dict):
                            acc = f.get("accession_number") or f.get("accessionNumber")
                            edgar = f.get("edgar_url") or f.get("url") or (
                                f"https://www.sec.gov/edgar/browse/?CIK={t_clean}" if not acc else f"https://www.sec.gov/Archives/edgar/data/{acc}.txt"
                            )
                            results.append(
                                SecFiling(
                                    ticker=t_clean,
                                    form_type=f.get("form_type") or f.get("form") or "10-K",
                                    filing_date=f.get("filing_date") or f.get("filed_date") or "",
                                    report_date=f.get("report_date") or f.get("period_end_date"),
                                    accession_number=acc,
                                    edgar_url=edgar,
                                    description=f.get("description") or f.get("title"),
                                )
                            )
                    if results:
                        return results
        except Exception:
            pass

    return []
