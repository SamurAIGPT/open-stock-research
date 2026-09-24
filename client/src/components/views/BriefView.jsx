"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { api } from "../../lib/api";

export default function BriefView({ ticker }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadBrief() {
      if (!ticker) return;
      setLoading(true);
      const data = await api.getBrief(ticker);
      setBrief(data);
      setLoading(false);
    }
    loadBrief();
  }, [ticker]);

  const handleCopy = () => {
    if (!brief) return;
    const text = `
=== EQUITY RESEARCH BRIEF: ${brief.company_name} (${brief.ticker}) ===
Date: ${new Date(brief.created_at).toLocaleDateString()}

OVERVIEW:
${brief.overview}

FINANCIAL ANALYSIS:
${brief.financial_summary}

VALUATION & MULTIPLES:
${brief.valuation_notes}

SOURCE REGULATORY CITATIONS:
${(brief.sec_filing_sources || []).map((f) => `- ${f.form_type} (Filed ${f.filing_date}): ${f.edgar_url}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Actions */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Executive Research Brief
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              Source-Linked Citations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated institutional fundamental research brief with verifiable
            SEC filing citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!brief}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied Brief" : "Copy Brief"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!brief}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <p className="text-xs text-slate-500 font-medium">
            Assembling executive equity brief from SEC filings and metrics...
          </p>
        </div>
      ) : !brief ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">
            Brief Unavailable for {ticker}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configure live MUAPI_API_KEY in Settings to compile source-linked
            research briefs.
          </p>
        </div>
      ) : (
        <div className="p-8 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-6 text-slate-800">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Equity Research Memorandum
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                {brief.company_name} ({brief.ticker})
              </h1>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Generated: {new Date(brief.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Section 1: Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Business Profile & Operations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {brief.overview}
            </p>
          </div>

          {/* Section 2: Financial Operations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Financial Structure & Margins
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {brief.financial_summary}
            </p>
          </div>

          {/* Section 3: Valuation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Market Valuation & Multiples
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {brief.valuation_notes}
            </p>
          </div>

          {/* Section 4: Sourced SEC Filings */}
          {brief.sec_filing_sources && brief.sec_filing_sources.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                4. Primary Regulatory Source Citations
              </h3>
              <div className="space-y-1.5">
                {brief.sec_filing_sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <span className="font-mono font-semibold text-slate-900">
                      {src.form_type} (Filed {src.filing_date})
                    </span>
                    {src.edgar_url && (
                      <a
                        href={src.edgar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>SEC EDGAR Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
