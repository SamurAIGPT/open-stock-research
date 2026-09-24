'use client';

import React from 'react';
import { 
  Building2, 
  Globe, 
  DollarSign, 
  PieChart, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function OverviewView({ ticker, profile, quote, metrics, loading }) {
  if (loading) {
    return (
      <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
        <div className="animate-spin text-2xl mb-2">⚡</div>
        <p className="text-xs text-slate-500 font-medium">Loading fundamental profile and real-time metrics for {ticker}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Company Profile & Quote Overview */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold font-mono text-blue-700 text-lg shadow-xs">
              {ticker.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">
                  {profile?.name || ticker}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {ticker}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {profile?.exchange || 'NASDAQ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>{profile?.sector || 'Diversified Sector'}</span>
                <span>•</span>
                <span>{profile?.industry || 'Industry Benchmark'}</span>
                {profile?.website && (
                  <>
                    <span>•</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quote Block */}
          {quote ? (
            <div className="flex flex-col md:items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  ${quote.current_price?.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-slate-400">USD</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold">
                <span
                  className={`flex items-center gap-0.5 ${
                    quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {quote.change >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {quote.change >= 0 ? '+' : ''}
                  {quote.change?.toFixed(2)} ({quote.change >= 0 ? '+' : ''}
                  {quote.change_percent?.toFixed(2)}%)
                </span>
                <span className="text-slate-400 font-normal">Today</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">Quote unconfigured or market closed</div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Market Cap</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {profile?.market_cap ? `$${(profile.market_cap / 1000).toFixed(2)}B` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">P/E Ratio</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {metrics?.pe_ratio ? `${metrics.pe_ratio.toFixed(1)}x` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Operating Margin</span>
            <span className="text-sm font-bold text-emerald-600 font-mono mt-1 block">
              {metrics?.operating_margin ? `${metrics.operating_margin.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Return on Equity</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {metrics?.roe ? `${metrics.roe.toFixed(1)}%` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Day High / Low</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {quote?.high && quote?.low ? `$${quote.high.toFixed(1)} / $${quote.low.toFixed(1)}` : '—'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Previous Close</span>
            <span className="text-sm font-bold text-slate-900 font-mono mt-1 block">
              {quote?.previous_close ? `$${quote.previous_close.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Business Description & Valuation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Description */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Business Profile & Operational Scope</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile?.description || (
              <span>
                {profile?.name || ticker} is a publicly traded company on the {profile?.exchange || 'NASDAQ'} stock exchange.
                To inspect live standardized income statements, SEC filings, and multi-factor screening criteria, connect your active Muapi or Treg credentials in Settings.
              </span>
            )}
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-700">Country:</span> {profile?.country || 'US'}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Currency:</span> {profile?.currency || 'USD'}
            </div>
            {profile?.ipo_date && (
              <div>
                <span className="font-semibold text-slate-700">IPO:</span> {profile.ipo_date}
              </div>
            )}
          </div>
        </div>

        {/* Valuation Multiples Snapshot */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Valuation Multiples</h2>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500">Trailing P/E</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.pe_ratio ? `${metrics.pe_ratio.toFixed(2)}x` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500">Price to Sales (P/S)</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.ps_ratio ? `${metrics.ps_ratio.toFixed(2)}x` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500">Price to Book (P/B)</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.pb_ratio ? `${metrics.pb_ratio.toFixed(2)}x` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500">EV / EBITDA</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.ev_to_ebitda ? `${metrics.ev_to_ebitda.toFixed(2)}x` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-500">Debt to Equity</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.debt_to_equity ? metrics.debt_to_equity.toFixed(2) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500">Beta (Volatility)</span>
              <span className="font-mono font-semibold text-slate-900">
                {metrics?.beta ? metrics.beta.toFixed(2) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
