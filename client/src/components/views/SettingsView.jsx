'use client';

import React, { useState, useEffect } from 'react';
import { Key, Shield, CheckCircle2, Zap, Save, Eye, EyeOff, Trash2, Check, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

export default function SettingsView() {
  const [muapiKey, setMuapiKey] = useState('');
  const [tregToken, setTregToken] = useState('');
  const [showMuapiKey, setShowMuapiKey] = useState(false);
  const [showTregToken, setShowTregToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load persisted keys on mount
  useEffect(() => {
    // 1. Instantly populate from localStorage to prevent any blank flicker on refresh
    const localMuapi = localStorage.getItem('muapi_api_key') || '';
    const localTreg = localStorage.getItem('treg_api_token') || '';
    if (localMuapi) setMuapiKey(localMuapi);
    if (localTreg) setTregToken(localTreg);

    // 2. Sync with backend settings
    async function loadBackendSettings() {
      try {
        const data = await api.getSettings();
        if (data) {
          if (data.muapi_api_key && !localMuapi) {
            setMuapiKey(data.muapi_api_key);
            localStorage.setItem('muapi_api_key', data.muapi_api_key);
          }
          if (data.treg_api_token && !localTreg) {
            setTregToken(data.treg_api_token);
            localStorage.setItem('treg_api_token', data.treg_api_token);
          }
        }
      } catch (err) {
        console.warn('Could not sync backend settings:', err);
      }
    }

    loadBackendSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');

    const cleanMuapi = muapiKey.trim();
    const cleanTreg = tregToken.trim();

    // 1. Immediately persist to localStorage
    if (cleanMuapi) {
      localStorage.setItem('muapi_api_key', cleanMuapi);
    } else {
      localStorage.removeItem('muapi_api_key');
    }

    if (cleanTreg) {
      localStorage.setItem('treg_api_token', cleanTreg);
    } else {
      localStorage.removeItem('treg_api_token');
    }

    // 2. Persist to backend server
    try {
      await api.saveSettings({
        muapi_api_key: cleanMuapi,
        treg_api_token: cleanTreg,
      });
      setStatusMessage('Settings and provider credentials saved successfully and will persist across refreshes.');
    } catch (err) {
      setStatusMessage('Settings saved to browser storage (backend offline).');
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  const handleClear = async () => {
    setMuapiKey('');
    setTregToken('');
    localStorage.removeItem('muapi_api_key');
    localStorage.removeItem('treg_api_token');
    try {
      await api.saveSettings({ muapi_api_key: '', treg_api_token: '' });
    } catch (err) {
      // ignore
    }
    setStatusMessage('API keys cleared.');
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
            {/* Muapi API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Muapi API Key</span>
                  {muapiKey ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                      Not configured
                    </span>
                  )}
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showMuapiKey ? 'text' : 'password'}
                  value={muapiKey}
                  onChange={(e) => setMuapiKey(e.target.value)}
                  placeholder="muapi_live_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowMuapiKey(!showMuapiKey)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                  title={showMuapiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showMuapiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

            {/* Treg API Token */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Treg API Token (Optional Direct Provider Pass-Through)</span>
                  {tregToken ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                      Optional
                    </span>
                  )}
                </label>
              </div>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showTregToken ? 'text' : 'password'}
                  value={tregToken}
                  onChange={(e) => setTregToken(e.target.value)}
                  placeholder="treg_tok_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowTregToken(!showTregToken)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 transition"
                  title={showTregToken ? 'Hide Token' : 'Show Token'}
                >
                  {showTregToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Direct pass-through token for Treg Finnhub, Marketstack, and Financial Datasets endpoints.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Persistent across page refreshes and browser sessions.</span>
            </span>

            <div className="flex items-center gap-2">
              {(muapiKey || tregToken) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          {saved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage || 'Settings saved successfully!'}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
