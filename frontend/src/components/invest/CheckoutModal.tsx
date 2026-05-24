'use client';
import { useState } from 'react';
import {
  InvestPool,
  PLATFORM_FEE_RATE,
  CryptoSymbol,
  cryptoEquiv,
  CRYPTO_SYMBOLS,
  CRYPTO_NAMES,
  CRYPTO_PRICES,
  OWNER_WALLETS,
  PaymentMethod,
} from '@/lib/investData';
import { WalletState } from '@/lib/investStore';
import WalletConnectModal from './WalletConnectModal';

interface Props {
  pool: InvestPool;
  walletState: WalletState;
  connecting: boolean;
  onConnect: (type: WalletState['type'], crypto: CryptoSymbol) => Promise<void>;
  onDisconnect: () => void;
  onConfirm: (amount: number, method: PaymentMethod, crypto: CryptoSymbol | null) => void;
  onClose: () => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'VISA', label: 'Visa', icon: '💳' },
  { id: 'MASTERCARD', label: 'Mastercard', icon: '💳' },
  { id: 'PAYPAL', label: 'PayPal', icon: '🅿️' },
  { id: 'CRYPTO', label: 'Crypto', icon: '₿' },
  { id: 'BANK', label: 'Bank Transfer', icon: '🏦' },
];

export default function CheckoutModal({
  pool,
  walletState,
  connecting,
  onConnect,
  onDisconnect,
  onConfirm,
  onClose,
}: Props) {
  const [amount, setAmount] = useState(String(pool.minInvestment));
  const [method, setMethod] = useState<PaymentMethod>('VISA');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const amtNum = parseFloat(amount) || 0;
  const fee = parseFloat((amtNum * PLATFORM_FEE_RATE).toFixed(2));
  const net = parseFloat((amtNum - fee).toFixed(2));
  const selectedCrypto = walletState.crypto;

  const remaining = pool.targetRaise - pool.amountRaised;
  const cappedNet = Math.min(net, remaining);

  const isCard = method === 'VISA' || method === 'MASTERCARD';
  const isCrypto = method === 'CRYPTO';
  const isBank = method === 'BANK';
  const isPayPal = method === 'PAYPAL';

  function handleConfirm() {
    if (amtNum < pool.minInvestment) return;
    if (isCrypto && !walletState.address) return;
    setSubmitted(true);
    onConfirm(amtNum, method, isCrypto ? selectedCrypto : null);
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Investment Confirmed</h2>
          <p className="text-gray-500 text-sm mb-1">
            ${amtNum.toLocaleString('en-AU')} AUD into {pool.name}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Platform fee: ${fee.toFixed(2)} · Net to pool: ${net.toFixed(2)}
          </p>
          {isCrypto && selectedCrypto && (
            <div className="bg-indigo-50 rounded-xl p-3 mb-6 text-sm text-indigo-700">
              ≈ {CRYPTO_SYMBOLS[selectedCrypto]}{cryptoEquiv(amtNum, selectedCrypto)} {selectedCrypto}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWalletModal && (
        <WalletConnectModal
          onConnect={async (type, crypto) => {
            await onConnect(type, crypto);
            setShowWalletModal(false);
            setMethod('CRYPTO');
          }}
          onClose={() => setShowWalletModal(false)}
          connecting={connecting}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Invest in {pool.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{pool.location} · {pool.expectedYield}% p.a.</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Investment amount (AUD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={pool.minInvestment}
                  step={500}
                  className="w-full pl-8 pr-14 py-3 border border-gray-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">AUD</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Min. ${pool.minInvestment.toLocaleString('en-AU')} AUD</p>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment method</p>
              <div className="grid grid-cols-5 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (m.id === 'CRYPTO' && !walletState.address) {
                        setShowWalletModal(true);
                      } else {
                        setMethod(m.id);
                      }
                    }}
                    className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all ${
                      method === m.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[9px] font-medium text-gray-700 mt-0.5 text-center leading-tight">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Method-specific UI */}
            {isCard && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Card number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/'))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center">🔒 Secured by Stripe</p>
              </div>
            )}

            {isPayPal && (
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="text-3xl mb-2">🅿️</div>
                <p className="text-sm text-blue-800 font-medium">You'll be redirected to PayPal</p>
                <p className="text-xs text-blue-600 mt-1">Complete payment securely on PayPal's platform</p>
              </div>
            )}

            {isCrypto && (
              <div className="p-4 bg-indigo-50 rounded-xl space-y-3">
                {walletState.address ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-indigo-600 font-semibold">Wallet connected</p>
                        <p className="text-sm font-mono text-indigo-900">{walletState.address}</p>
                        {selectedCrypto && (
                          <p className="text-xs text-indigo-500 mt-0.5">
                            Paying in {CRYPTO_NAMES[selectedCrypto]} ({selectedCrypto})
                            {amtNum > 0 && ` · ${CRYPTO_SYMBOLS[selectedCrypto]}${cryptoEquiv(amtNum, selectedCrypto)}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={onDisconnect}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className="text-xs text-indigo-600 bg-indigo-100 rounded-lg p-2">
                      <p className="font-semibold">Send to trust wallet:</p>
                      {selectedCrypto && (
                        <p className="font-mono mt-0.5 break-all">{OWNER_WALLETS[selectedCrypto]}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            )}

            {isBank && (
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-gray-600">Bank transfer details</p>
                <div className="font-mono text-sm text-gray-900">{OWNER_WALLETS.AUD}</div>
                <p className="text-xs text-gray-400">Reference: {pool.id.toUpperCase()}-{Date.now().toString().slice(-6)}</p>
                <p className="text-xs text-amber-600">Allow 1-2 business days for funds to clear</p>
              </div>
            )}

            {/* Fee summary */}
            {amtNum >= pool.minInvestment && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Investment amount</span>
                  <span>${amtNum.toLocaleString('en-AU')} AUD</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform fee (2%)</span>
                  <span>−${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Net to pool</span>
                  <span>${cappedNet.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-600 text-xs">
                  <span>Est. annual return ({pool.expectedYield}%)</span>
                  <span>+${(net * pool.expectedYield / 100).toFixed(0)} AUD/yr</span>
                </div>
                {isCrypto && selectedCrypto && (
                  <div className="flex justify-between text-indigo-500 text-xs">
                    <span>Returns paid in</span>
                    <span>{CRYPTO_NAMES[selectedCrypto]} ({selectedCrypto})</span>
                  </div>
                )}
              </div>
            )}

            {amtNum > 0 && amtNum < pool.minInvestment && (
              <p className="text-xs text-red-500">
                Minimum investment is ${pool.minInvestment.toLocaleString('en-AU')} AUD
              </p>
            )}

            <button
              onClick={handleConfirm}
              disabled={amtNum < pool.minInvestment || (isCrypto && !walletState.address)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Confirm Investment · ${amtNum > 0 ? amtNum.toLocaleString('en-AU') : '0'} AUD
            </button>

            <p className="text-center text-[10px] text-gray-400">
              Demo environment — no real funds are processed
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
