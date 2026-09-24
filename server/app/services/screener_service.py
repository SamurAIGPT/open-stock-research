"""Fundamental equity screener & metrics service.
Consumes Muapi's code-complete `market-stock-screener` route (Financial Datasets)
with automatic fallback to Treg direct provider pass-through.
"""

import logging
import httpx
from typing import Optional
from ..config import settings
from ..models import FinancialMetrics, ScreenerResultItem

logger = logging.getLogger(__name__)


def _resolve_tokens(api_key: Optional[str] = None, treg_token: Optional[str] = None) -> tuple[str, str]:
    muapi = (api_key or settings.muapi_api_key or "").strip()
    treg = (treg_token or settings.treg_api_token or "").strip()
    if muapi.startswith("treg_") and not treg:
        treg = muapi
    return muapi, treg


async def get_financial_metrics(
    ticker: str,
    period: str = "annual",
    api_key: Optional[str] = None,
    treg_token: Optional[str] = None,
) -> Optional[FinancialMetrics]:
    """Retrieve valuation, profitability, liquidity, and leverage ratios for a ticker."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return None

    muapi_key, treg_tok = _resolve_tokens(api_key, treg_token)

    # 1. Try Muapi endpoint
    if muapi_key and not muapi_key.startswith("treg_"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": muapi_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/market-stock-screener"
                payload = {
                    "mode": "metrics_snapshot",
                    "ticker": t_clean,
                    "period": period,
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    m = data.get("result") or data.get("metrics") or data
                    return FinancialMetrics(
                        ticker=t_clean,
                        pe_ratio=float(m["pe_ratio"]) if m.get("pe_ratio") else (float(m["price_to_earnings_ratio"]) if m.get("price_to_earnings_ratio") else None),
                        forward_pe=float(m["forward_pe"]) if m.get("forward_pe") else None,
                        ps_ratio=float(m["ps_ratio"]) if m.get("ps_ratio") else (float(m["price_to_sales_ratio"]) if m.get("price_to_sales_ratio") else None),
                        pb_ratio=float(m["pb_ratio"]) if m.get("pb_ratio") else (float(m["price_to_book_ratio"]) if m.get("price_to_book_ratio") else None),
                        ev_to_ebitda=float(m["ev_to_ebitda"]) if m.get("ev_to_ebitda") else (float(m["enterprise_value_to_ebitda_ratio"]) if m.get("enterprise_value_to_ebitda_ratio") else None),
                        operating_margin=float(m["operating_margin"]) if m.get("operating_margin") else None,
                        net_margin=float(m["net_margin"]) if m.get("net_margin") else (float(m["net_profit_margin"]) if m.get("net_profit_margin") else None),
                        roe=float(m["roe"]) if m.get("roe") else (float(m["return_on_equity"]) if m.get("return_on_equity") else None),
                        roa=float(m["roa"]) if m.get("roa") else (float(m["return_on_assets"]) if m.get("return_on_assets") else None),
                        debt_to_equity=float(m["debt_to_equity"]) if m.get("debt_to_equity") else (float(m["debt_to_equity_ratio"]) if m.get("debt_to_equity_ratio") else None),
                        free_cash_flow=float(m["free_cash_flow"]) if m.get("free_cash_flow") else None,
                        dividend_yield=float(m["dividend_yield"]) if m.get("dividend_yield") else None,
                        beta=float(m["beta"]) if m.get("beta") else None,
                    )
                else:
                    logger.warning(f"Muapi metrics returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Muapi metrics: {exc}")

    # 2. Try Treg direct pass-through (financialdatasets.financial-metrics.snapshot)
    if treg_tok:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": treg_tok}
                url = f"{settings.treg_base_url.rstrip('/')}/call/financialdatasets.financial-metrics.snapshot"
                resp = await client.get(url, params={"ticker": t_clean}, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    m = data.get("snapshot") or data.get("metrics") or data.get("result") or data
                    return FinancialMetrics(
                        ticker=t_clean,
                        pe_ratio=float(m["pe_ratio"]) if m.get("pe_ratio") else (float(m["price_to_earnings_ratio"]) if m.get("price_to_earnings_ratio") else None),
                        forward_pe=float(m["forward_pe"]) if m.get("forward_pe") else None,
                        ps_ratio=float(m["ps_ratio"]) if m.get("ps_ratio") else (float(m["price_to_sales_ratio"]) if m.get("price_to_sales_ratio") else None),
                        pb_ratio=float(m["pb_ratio"]) if m.get("pb_ratio") else (float(m["price_to_book_ratio"]) if m.get("price_to_book_ratio") else None),
                        ev_to_ebitda=float(m["ev_to_ebitda"]) if m.get("ev_to_ebitda") else None,
                        operating_margin=float(m["operating_margin"]) if m.get("operating_margin") else None,
                        net_margin=float(m["net_margin"]) if m.get("net_margin") else None,
                        roe=float(m["roe"]) if m.get("roe") else (float(m["return_on_equity"]) if m.get("return_on_equity") else None),
                        roa=float(m["roa"]) if m.get("roa") else None,
                        debt_to_equity=float(m["debt_to_equity"]) if m.get("debt_to_equity") else None,
                        free_cash_flow=float(m["free_cash_flow"]) if m.get("free_cash_flow") else None,
                        dividend_yield=float(m["dividend_yield"]) if m.get("dividend_yield") else None,
                        beta=float(m["beta"]) if m.get("beta") else None,
                    )
                else:
                    logger.warning(f"Treg financial-metrics returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Treg financial-metrics: {exc}")

    return None


async def run_stock_screener(
    filters: list[str],
    limit: int = 25,
    api_key: Optional[str] = None,
    treg_token: Optional[str] = None,
) -> list[ScreenerResultItem]:
    """Execute multi-variable screening across public companies using 'field:operator:value' filters."""
    muapi_key, treg_tok = _resolve_tokens(api_key, treg_token)

    # 1. Try Muapi endpoint
    if muapi_key and not muapi_key.startswith("treg_"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"x-api-key": muapi_key, "Content-Type": "application/json"}
                url = f"{settings.muapi_base_url.rstrip('/')}/api/v1/market-stock-screener"
                payload = {
                    "mode": "screener",
                    "filters": filters,
                    "limit": limit,
                }
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("result") or data.get("items") or []
                    results = []
                    for it in items:
                        if isinstance(it, dict):
                            results.append(
                                ScreenerResultItem(
                                    ticker=it.get("ticker") or it.get("symbol") or "",
                                    name=it.get("name") or it.get("company_name") or "",
                                    sector=it.get("sector"),
                                    industry=it.get("industry"),
                                    price=float(it["price"]) if it.get("price") else None,
                                    market_cap=float(it["market_cap"]) if it.get("market_cap") else None,
                                    pe_ratio=float(it["pe_ratio"]) if it.get("pe_ratio") else None,
                                    operating_margin=float(it["operating_margin"]) if it.get("operating_margin") else None,
                                    roe=float(it["roe"]) if it.get("roe") else None,
                                    volume=int(it["volume"]) if it.get("volume") else None,
                                )
                            )
                    if results:
                        return results
                else:
                    logger.warning(f"Muapi screener returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Muapi screener: {exc}")

    # 2. Try Treg direct pass-through (financialdatasets.financials.search.screener)
    if treg_tok:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"X-Treg-Token": treg_tok}
                url = f"{settings.treg_base_url.rstrip('/')}/call/financialdatasets.financials.search.screener"
                resp = await client.post(url, json={"filters": filters, "limit": limit}, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("results") or data.get("items") or []
                    results = []
                    for it in items:
                        if isinstance(it, dict):
                            results.append(
                                ScreenerResultItem(
                                    ticker=it.get("ticker") or it.get("symbol") or "",
                                    name=it.get("name") or it.get("company_name") or "",
                                    sector=it.get("sector"),
                                    industry=it.get("industry"),
                                    price=float(it["price"]) if it.get("price") else None,
                                    market_cap=float(it["market_cap"]) if it.get("market_cap") else None,
                                    pe_ratio=float(it["pe_ratio"]) if it.get("pe_ratio") else None,
                                    operating_margin=float(it["operating_margin"]) if it.get("operating_margin") else None,
                                    roe=float(it["roe"]) if it.get("roe") else None,
                                    volume=int(it["volume"]) if it.get("volume") else None,
                                )
                            )
                    if results:
                        return results
                else:
                    logger.warning(f"Treg screener returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.error(f"Error calling Treg screener: {exc}")

    return []
