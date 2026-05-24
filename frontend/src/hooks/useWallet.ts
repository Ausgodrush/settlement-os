'use client';
import { useState, useCallback } from 'react';
import { WalletState, getWallet, saveWallet, disconnectWallet } from '@/lib/investStore';
import { CryptoSymbol } from '@/lib/investData';

function mockAddress(type: string): string {
  const chars = '0123456789abcdef';
  const hex = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  if (type === 'PHANTOM') return `${Math.random().toString(36).slice(2, 6)}...${Math.random().toString(36).slice(2, 6)}`;
  return `0x${hex.slice(0, 4)}...${hex.slice(-4)}`;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(() => {
    if (typeof window === 'undefined') return { type: null, address: null, crypto: null };
    return getWallet();
  });
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (type: WalletState['type'], crypto: CryptoSymbol) => {
    if (!type) return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const address = mockAddress(type);
    const next: WalletState = { type, address, crypto };
    saveWallet(next);
    setWallet(next);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setWallet({ type: null, address: null, crypto: null });
  }, []);

  return { wallet, connecting, connect, disconnect };
}
