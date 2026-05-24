'use client';
import React, { useState } from 'react';
import { CryptoSymbol, CRYPTO_SYMBOLS, CRYPTO_PRICES } from '@/lib/investData';
import { WalletState } from '@/lib/investStore';
import { MetaMaskIcon, PhantomIcon } from './PaymentIcons';

interface Props {
  onConnect: (type: WalletState['type'], crypto: CryptoSymbol) => Promise<void>;
  onClose: () => void;
  connecting: boolean;
}

const WALLETS: { type: WalletState['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'METAMASK', label: 'MetaMask', icon: <MetaMaskIcon className="w-8 h-8" /> },
  { type: 'PHANTOM', label: 'Phantom', icon: <PhantomIcon className="w-8 h-8" /> },
];

const CRYPTOS: CryptoSymbol[] = ['BTC', 'ETH', 'SOL'];

export default function WalletConnectModal({ onConnect, onClose, connecting }: Props) {
  const [selectedWallet, setSelectedWallet] = useState<WalletState['type']>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('ETH');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Connect Wallet</h2>
              <p className="text-sm text-gray-500 mt-0.5">Select your wallet to invest with crypto</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Crypto selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pay with</p>
            <div className="grid grid-cols-3 gap-2">
              {CRYPTOS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrypto(c)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selectedCrypto === c
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{CRYPTO_SYMBOLS[c]}</span>
                  <span className="text-xs font-semibold text-gray-800 mt-1">{c}</span>
                  <span className="text-[10px] text-gray-400">${CRYPTO_PRICES[c].toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Wallet provider</p>
            <div className="space-y-2">
              {WALLETS.map((w) => (
                <button
                  key={w.type}
                  onClick={() => setSelectedWallet(w.type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selectedWallet === w.type
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {w.icon}
                  <span className="font-medium text-gray-900">{w.label}</span>
                  {selectedWallet === w.type && (
                    <svg className="w-4 h-4 text-indigo-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectedWallet && onConnect(selectedWallet, selectedCrypto)}
            disabled={!selectedWallet || connecting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting…
              </>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
