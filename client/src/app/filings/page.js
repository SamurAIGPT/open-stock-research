'use client';

import React from 'react';
import FilingsView from '../../components/views/FilingsView';
import { useTicker } from '../../context/TickerContext';

export default function FilingsPage() {
  const { ticker } = useTicker();

  return <FilingsView ticker={ticker} />;
}
