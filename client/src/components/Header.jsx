'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  Bookmark, 
  Settings, 
  Activity, 
  Plus, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import CustomDropdown from './CustomDropdown';

export default function Header({
  activeTicker,
  setActiveTicker,
  quote,
  watchlist = [],
  onAddToWatchlist,
  onRemoveFromWatchlist,
  onOpenSettings,
}) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveTicker(searchInput.trim().toUpperCase());
    setSearchInput('');
  };

  const watchlistOptions = watchlist.map((item) => ({
    value: item.ticker,
    label: `${item.ticker} • ${item.company_name}`,
    sublabel: item.notes || 'Tracked equity',
  }));

  const isCurrentInWatchlist = watchlist.some((item) => item.ticker === activeTicker);

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Ticker Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTicker('AAPL')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  Open Stock Research
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Fundamental Equity Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                SEC Filings • Standardized Statements • EOD Price Bars • Multi-Filter Screener
              </p>
            </div>
          </div>

          {/* Quick Watchlist Selector */}
          {watchlistOptions.length > 0 && (
            <div className="hidden md:block">
              <CustomDropdown
                value={activeTicker}
                onChange={(val) => setActiveTicker(val)}
                options={watchlistOptions}
                placeholder="Select Watchlist Ticker..."
                icon={Bookmark}
                buttonClassName="bg-slate-50 border-slate-200"
              />
            </div>
          )}
        </div>

        {/* Search & Active Quote Bar */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticker (e.g. NVDA, MSFT)..."
              className="w-44 sm:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:bg-white focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </form>

          {/* Active Ticker Real-time Quote Pill */}
          {quote ? (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold font-mono text-slate-900">{activeTicker}</span>
              <span className="text-xs font-semibold text-slate-800">${quote.current_price?.toFixed(2)}</span>
              <span
                className={`text-[11px] font-bold font-mono ${
                  quote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {quote.change >= 0 ? '+' : ''}
                {quote.change_percent?.toFixed(2)}%
              </span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <span className="font-mono font-bold text-slate-800">{activeTicker}</span>
            </div>
          )}

          {/* Watchlist Toggle */}
          {isCurrentInWatchlist ? (
            <button
              onClick={() => onRemoveFromWatchlist(activeTicker)}
              title="Remove from Watchlist"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition shadow-xs cursor-pointer"
            >
              <Bookmark className="w-4 h-4 fill-blue-600 text-blue-600" />
            </button>
          ) : (
            <button
              onClick={() => onAddToWatchlist(activeTicker)}
              title="Save to Watchlist"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition shadow-xs cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Configure API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
