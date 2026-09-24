'use client';

import React, { useState } from 'react';
import { Filter, Play, Plus, X, Search, Sparkles, Building2, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import CustomDropdown from '../CustomDropdown';

const PRESET_SCREENS = [
  {
    name: 'Mega-Cap Cash Generators',
    filters: ['market_cap:gt:500000000000', 'operating_margin:gt:20'],
    description: 'Companies over $500B valuation with >20% operating margin',
  },
  {
    name: 'Quality Compounders (High ROE & Margin)',
    filters: ['operating_margin:gt:25', 'roe:gt:18'],
    description: 'High capital efficiency with >25% operating margin and >18% ROE',
  },
  {
    name: 'Reasonable Valuation Multiples',
    filters: ['pe_ratio:lt:25', 'market_cap:gt:20000000000'],
    description: 'Profitable companies trading under 25x trailing P/E',
  },
];

const FIELD_OPTIONS = [
  { value: 'market_cap', label: 'Market Capitalization ($)' },
  { value: 'pe_ratio', label: 'Price-to-Earnings (P/E)' },
  { value: 'operating_margin', label: 'Operating Margin (%)' },
  { value: 'roe', label: 'Return on Equity (%)' },
  { value: 'debt_to_equity', label: 'Debt to Equity' },
];

const OPERATOR_OPTIONS = [
  { value: 'gt', label: 'Greater Than (>)' },
  { value: 'gte', label: 'Greater Than or Equal (>=)' },
  { value: 'lt', label: 'Less Than (<)' },
  { value: 'lte', label: 'Less Than or Equal (<=)' },
];

export default function ScreenerView({ onSelectTicker }) {
  const [activeFilters, setActiveFilters] = useState([
    'market_cap:gt:100000000000',
    'operating_margin:gt:15',
  ]);
  const [selectedField, setSelectedField] = useState('pe_ratio');
  const [selectedOperator, setSelectedOperator] = useState('lt');
  const [filterValue, setFilterValue] = useState('30');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executed, setExecuted] = useState(false);

  const handleAddFilter = (e) => {
    e.preventDefault();
    if (!filterValue.trim()) return;
    const rule = `${selectedField}:${selectedOperator}:${filterValue.trim()}`;
    if (!activeFilters.includes(rule)) {
      setActiveFilters([...activeFilters, rule]);
    }
    setFilterValue('');
  };

  const handleRemoveFilter = (rule) => {
    setActiveFilters(activeFilters.filter((f) => f !== rule));
  };

  const handleRunScreener = async () => {
    setLoading(true);
    setExecuted(true);
    const data = await api.runScreener(activeFilters, 30);
    setResults(data);
    setLoading(false);
  };

  const handleApplyPreset = (preset) => {
    setActiveFilters(preset.filters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Multi-Factor Fundamental Screener</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
              Financial Datasets Screener
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filter public equity universes using fundamental ratios, valuation multiples, and profitability thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunScreener}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Screening Universe...' : 'Run Screener'}</span>
        </button>
      </div>

      {/* Preset Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESET_SCREENS.map((preset, idx) => (
          <div
            key={idx}
            onClick={() => handleApplyPreset(preset)}
            className="p-4 rounded-xl glass-panel border border-slate-200 hover:border-blue-300 transition cursor-pointer shadow-xs space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{preset.name}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">{preset.description}</p>
          </div>
        ))}
      </div>

      {/* Filter Builder Panel */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Active Screener Rules ({activeFilters.length})
        </h3>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((rule, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-medium shadow-2xs"
            >
              <span>{rule}</span>
              <button
                type="button"
                onClick={() => handleRemoveFilter(rule)}
                className="text-blue-500 hover:text-rose-600 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {activeFilters.length === 0 && (
            <span className="text-xs text-slate-400 italic">No active filters. Add rules below.</span>
          )}
        </div>

        {/* Filter Builder Form using CustomDropdown */}
        <form onSubmit={handleAddFilter} className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <CustomDropdown
            value={selectedField}
            onChange={(val) => setSelectedField(val)}
            options={FIELD_OPTIONS}
            className="w-56"
          />

          <CustomDropdown
            value={selectedOperator}
            onChange={(val) => setSelectedOperator(val)}
            options={OPERATOR_OPTIONS}
            className="w-52"
          />

          <input
            type="number"
            step="any"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Threshold value..."
            className="w-36 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500 shadow-xs"
          />

          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Rule</span>
          </button>
        </form>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs">
          <div className="animate-spin text-2xl mb-2">⚡</div>
          <p className="text-xs text-slate-500 font-medium">Scanning US equity database against active rules...</p>
        </div>
      ) : executed && results.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No Equities Matched Criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Adjust your filter thresholds or configure live MUAPI_API_KEY in Settings to scan live market data.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Matched Public Equities ({results.length})</span>
            <span className="text-[11px] text-slate-400">Click row to inspect full profile & statements</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 font-semibold text-slate-700">Ticker</th>
                <th className="py-2.5 font-semibold text-slate-700">Company Name</th>
                <th className="py-2.5 font-semibold text-slate-700">Sector</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">Price</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">Market Cap</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">P/E</th>
                <th className="py-2.5 font-semibold text-slate-700 text-right">Op Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r, idx) => (
                <tr
                  key={idx}
                  onClick={() => onSelectTicker(r.ticker)}
                  className="hover:bg-blue-50/60 transition cursor-pointer text-slate-700"
                >
                  <td className="py-2.5 font-mono font-bold text-blue-600">{r.ticker}</td>
                  <td className="py-2.5 font-medium text-slate-900 truncate max-w-xs">{r.name}</td>
                  <td className="py-2.5 text-slate-500">{r.sector || '—'}</td>
                  <td className="py-2.5 font-mono text-right text-slate-900">
                    {r.price ? `$${r.price.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2.5 font-mono text-right text-slate-900">
                    {r.market_cap ? `$${(r.market_cap / 1e9).toFixed(1)}B` : '—'}
                  </td>
                  <td className="py-2.5 font-mono text-right text-slate-900">
                    {r.pe_ratio ? `${r.pe_ratio.toFixed(1)}x` : '—'}
                  </td>
                  <td className="py-2.5 font-mono text-right text-emerald-600 font-semibold">
                    {r.operating_margin ? `${r.operating_margin.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
