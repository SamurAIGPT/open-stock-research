'use client';

import React from 'react';
import OverviewView from '../components/views/OverviewView';
import { useTicker } from '../context/TickerContext';

export default function OverviewPage() {
  const { ticker, profile, quote, metrics, loadingOverview } = useTicker();

  return (
    <OverviewView
      ticker={ticker}
      profile={profile}
      quote={quote}
      metrics={metrics}
      loading={loadingOverview}
    />
  );
}
