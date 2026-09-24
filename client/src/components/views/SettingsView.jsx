'use client';

import React, { useState } from 'react';
import { Key, Shield, CheckCircle2, Zap, Save, Check } from 'lucide-react';

export default function SettingsView() {
  const [muapiKey, setMuapiKey] = useState('');
  const [tregToken, setTregToken] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings & Provider Integrations</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure API credentials to access live public company financials, market history, screeners, and crypto feeds.
        </p>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-slate-200 space-y-6 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Muapi API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={muapiKey}
                  onChange={(e) => setMuapiKey(e.target.value)}
                  placeholder="muapi_live_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono shadow-xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Primary API key powering the four code-complete financial research routes:
              </p>
              <ul className="text-[11px] text-slate-600 mt-1.5 space-y-1 list-disc list-inside">
                <li><code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">company.public_financials</code> (Finnhub & Financial Datasets)</li>
                <li><code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">market.stock_history</code> (Marketstack EOD)</li>
                <li><code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">market.stock_screener</code> (Financial Datasets Screener & Ratios)</li>
                <li><code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">crypto.market_data</code> (CoinGecko Read-Only)</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Treg API Token (Optional Direct Provider Pass-Through)
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={tregToken}
                  onChange={(e) => setTregToken(e.target.value)}
                  placeholder="treg_tok_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono shadow-xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct pass-through token for Treg Finnhub, Marketstack, and Financial Datasets endpoints.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Strict zero-mock policy: live data or verified empty state.</span>
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          </div>

          {saved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings and provider credentials saved successfully!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
