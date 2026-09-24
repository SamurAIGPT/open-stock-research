"""Executive Research Brief Router."""

from fastapi import APIRouter, HTTPException
from ..models import ResearchBrief
from ..services.brief_service import generate_company_research_brief

router = APIRouter(prefix="/api/brief", tags=["Research Brief"])


@router.get("/{ticker}", response_model=ResearchBrief)
async def generate_brief_endpoint(ticker: str):
    """Compile a citation-backed fundamental equity brief with SEC filing links."""
    brief = await generate_company_research_brief(ticker)
    if not brief:
        raise HTTPException(status_code=404, detail=f"Unable to compile brief for {ticker}. Provider unconfigured.")
    return brief
