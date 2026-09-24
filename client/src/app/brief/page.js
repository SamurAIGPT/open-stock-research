'use client';

import React from 'react';
import BriefView from '../../components/views/BriefView';
import { useTicker } from '../../context/TickerContext';

export default function BriefPage() {
  const { ticker } = useTicker();

  return <BriefView ticker={ticker} />;
}
