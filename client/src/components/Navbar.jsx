'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTicker } from '../context/TickerContext';
import { 
  Building2, 
  BarChart2, 
  FileText, 
  Filter, 
  FileCheck2, 
  FileSignature, 
  Coins, 
  Settings 
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Company Overview', icon: Building2, withTicker: true },
  { href: '/chart', label: 'Price Chart & EOD', icon: BarChart2, withTicker: true },
  { href: '/financials', label: 'Financial Statements', icon: FileText, withTicker: true },
  { href: '/screener', label: 'Stock Screener', icon: Filter, withTicker: false },
  { href: '/filings', label: 'SEC Filings', icon: FileCheck2, withTicker: true },
  { href: '/brief', label: 'Research Brief', icon: FileSignature, withTicker: true },
  { href: '/crypto', label: 'Crypto Monitor', icon: Coins, withTicker: false },
  { href: '/settings', label: 'Settings', icon: Settings, withTicker: false },
];

export default function Navbar() {
  const pathname = usePathname();
  const { ticker } = useTicker();

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const targetHref = item.withTicker && ticker ? `${item.href === '/' ? '' : item.href}/?ticker=${encodeURIComponent(ticker)}` : item.href;

            return (
              <Link
                key={item.href}
                href={targetHref}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
