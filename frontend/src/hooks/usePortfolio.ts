'use client';
import { useState, useCallback } from 'react';
import { PortfolioHolding, InvestPool } from '@/lib/investData';
import { getPortfolio, getPlatformFees, getPools, invest as storeInvest, InvestResult } from '@/lib/investStore';
import { CryptoSymbol } from '@/lib/investData';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>(() => {
    if (typeof window === 'undefined') return [];
    return getPortfolio();
  });
  const [fees, setFees] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return getPlatformFees();
  });

  const invest = useCallback(
    (pool: InvestPool, amountAUD: number, method: string, crypto: CryptoSymbol | null): InvestResult => {
      const result = storeInvest(pool, amountAUD, method, crypto);
      setPortfolio(getPortfolio());
      setFees(getPlatformFees());
      return result;
    },
    [],
  );

  const totalInvested = portfolio.reduce((s, h) => s + h.amount, 0);
  const totalFees = portfolio.reduce((s, h) => s + h.feePaid, 0);
  const projectedAnnual = portfolio.reduce((s, h) => s + h.netAmount * (h.expectedYield / 100), 0);

  return { portfolio, fees, invest, totalInvested, totalFees, projectedAnnual };
}

export function usePools() {
  const [pools, setPools] = useState<InvestPool[]>(() => {
    if (typeof window === 'undefined') return [];
    return getPools();
  });

  const refresh = useCallback(() => {
    setPools(getPools());
  }, []);

  return { pools, refresh };
}
