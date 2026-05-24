'use client';
import { useState, useEffect, useCallback } from 'react';
import { deals as dealsApi } from '@/lib/api';
import { Deal, DealStatus, PaginatedResponse } from '@/types';

export function useDeals(initialStatus?: DealStatus) {
  const [data, setData] = useState<PaginatedResponse<Deal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<DealStatus | undefined>(initialStatus);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dealsApi.list({ status, search: search || undefined });
      setData(result);
    } catch (e: any) {
      if (e?.status !== 401) setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, status, setStatus, search, setSearch, refetch: fetch };
}

export function useDeal(id: string | null) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await dealsApi.get(id);
      setDeal(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateLocal = useCallback((updater: (d: Deal) => Deal) => {
    setDeal((prev) => (prev ? updater(prev) : prev));
  }, []);

  return { deal, loading, error, refetch: fetch, updateLocal };
}
