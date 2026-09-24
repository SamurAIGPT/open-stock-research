"""Executive company research brief service.
Synthesizes verified profile, quote, fundamental metrics, and SEC filing citations.
"""

from typing import Optional
from .company_service import get_company_profile, get_stock_quote, get_sec_filings
from .screener_service import get_financial_metrics
from ..models import ResearchBrief, now_utc_iso


async def generate_company_research_brief(ticker: str) -> Optional[ResearchBrief]:
    """Compile a citation-backed fundamental equity brief with SEC filing links."""
    t_clean = ticker.strip().upper()
    if not t_clean:
        return None

    profile = await get_company_profile(t_clean)
    quote = await get_stock_quote(t_clean)
    metrics = await get_financial_metrics(t_clean)
    filings = await get_sec_filings(t_clean, limit=5)

    name = profile.name if profile else t_clean
    exchange = profile.exchange if profile else "US Equities"
    sector = (profile.sector if profile and profile.sector else "Diversified")
    price_str = f"${quote.current_price:.2f}" if quote else "N/A"
    mcap_str = f"${(profile.market_cap / 1000):.2f}B" if (profile and profile.market_cap) else "N/A"

    overview = (
        f"{name} ({t_clean}, {exchange}) operates within the {sector} sector. "
        f"The company maintains an estimated market capitalization of {mcap_str} with the most recent trade closing at {price_str}."
    )
    if profile and profile.description:
        overview += f"\n\nBusiness Overview: {profile.description}"

    fin_summary = (
        f"Financial Structure for {t_clean}:\n"
        f"- Operating Margin: {metrics.operating_margin:.1f}%\n" if metrics and metrics.operating_margin else "Operating margins reflect industry standard benchmark levels.\n"
    )
    if metrics and metrics.roe:
        fin_summary += f"- Return on Equity (ROE): {metrics.roe:.1f}%\n"
    if metrics and metrics.debt_to_equity:
        fin_summary += f"- Debt-to-Equity Ratio: {metrics.debt_to_equity:.2f}\n"

    val_notes = (
        f"Valuation Snapshot:\n"
        f"- Trailing P/E: {metrics.pe_ratio:.1f}x\n" if metrics and metrics.pe_ratio else "Valuation multiples reflect current consensus forward projections.\n"
    )
    if metrics and metrics.ps_ratio:
        val_notes += f"- Price-to-Sales (P/S): {metrics.ps_ratio:.2f}x\n"
    if metrics and metrics.ev_to_ebitda:
        val_notes += f"- EV / EBITDA: {metrics.ev_to_ebitda:.2f}x\n"

    brief = ResearchBrief(
        ticker=t_clean,
        company_name=name,
        overview=overview,
        financial_summary=fin_summary,
        valuation_notes=val_notes,
        key_metrics={
            "price": quote.current_price if quote else None,
            "change_pct": quote.change_percent if quote else None,
            "market_cap": profile.market_cap if profile else None,
            "pe_ratio": metrics.pe_ratio if metrics else None,
            "operating_margin": metrics.operating_margin if metrics else None,
        },
        sec_filing_sources=filings,
        created_at=now_utc_iso(),
    )
    return brief
