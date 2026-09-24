'use client';

import React from 'react';
import StatementsView from '../../components/views/StatementsView';
import { useTicker } from '../../context/TickerContext';

export default function FinancialsPage() {
  const { ticker } = useTicker();

  return <StatementsView ticker={ticker} />;
}
