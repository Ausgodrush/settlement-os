'use client';
import { useState } from 'react';
import { VisaIcon, MastercardIcon, PayPalIcon, BankIcon } from '@/components/invest/PaymentIcons';
import WalletConnectModal from '@/components/invest/WalletConnectModal';
import { CRYPTO_SYMBOLS, CRYPTO_NAMES, CRYPTO_PRICES, CryptoSymbol, cryptoEquiv, OWNER_WALLETS } from '@/lib/investData';
import { useWallet } from '@/hooks/useWallet';

interface Listing {
  id: string;
  propertyAddress: string;
  suburb: string;
  purchasePrice: number;
  currency: string;
}

interface Props {
  listing: Listing;
  onClose: () => void;
}

type Method = 'VISA' | 'MASTERCARD' | 'PAYPAL' | 'CRYPTO' | 'BANK';

const METHODS: { id: Method; label: string; icon: React.ReactNode }[] = [
  { id: 'VISA',       label: 'Visa',       icon: <VisaIcon className="w-10 h-7 rounded" /> },
  { id: 'MASTERCARD', label: 'Mastercard', icon: <MastercardIcon className="w-10 h-7 rounded" /> },
  { id: 'PAYPAL',     label: 'PayPal',     icon: <PayPalIcon className="w-10 h-7 rounded" /> },
  { id: 'CRYPTO',     label: 'Crypto',     icon: <span className="text-xl">₿</span> },
  { id: 'BANK',       label: 'Bank',       icon: <BankIcon className="w-10 h-7 rounded" /> },
];

const FEE_RATE = 0.02;

const METHOD_LABELS: Record<Method, string> = {
  VISA: 'Visa card', MASTERCARD: 'Mastercard', PAYPAL: 'PayPal', CRYPTO: 'crypto wallet', BANK: 'bank transfer',
};

export default function BuyNowModal({ listing, onClose }: Props) {
  const [method, setMethod] = useState<Method>('VISA');
  const [confirmed, setConfirmed] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { wallet, connecting, connect, disconnect } = useWallet();

  const price = listing.purchasePrice;
  const fee   = parseFloat((price * FEE_RATE).toFixed(2));
  const selectedCrypto = wallet.crypto;

  function handleMethodClick(id: Method) {
    if (id === 'CRYPTO' && !wallet.address) {
      setShowWalletModal(true);
    } else {
      setMethod(id);
    }
  }

  function handleConfirm() {
    if (method === 'CRYPTO' && !wallet.address) { setShowWalletModal(true); return; }
    setConfirmed(true);
  }

  return (
    <>
      {showWalletModal && (
        <WalletConnectModal
          onConnect={async (type, crypto) => {
            await connect(type, crypto);
            setShowWalletModal(false);
            setMethod('CRYPTO');
          }}
          onClose={() => setShowWalletModal(false)}
          connecting={connecting}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Purchase Property</h2>
              <p className="text-sm text-gray-500 mt-0.5">{listing.propertyAddress}</p>
              <p className="text-xs text-gray-400">{listing.suburb}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0 ml-4">&times;</button>
          </div>

          <div className="p-6">
            {confirmed ? (
              /* ── Success state ── */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Purchase Initiated!</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Payment via <span className="font-semibold text-gray-700">{METHOD_LABELS[method]}</span> received.
                </p>
                {method === 'CRYPTO' && selectedCrypto && (
                  <p className="text-sm text-indigo-600 font-medium mb-1">
                    ≈ {CRYPTO_SYMBOLS[selectedCrypto]}{cryptoEquiv(price, selectedCrypto)} {selectedCrypto}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-6">
                  Our settlement team will contact you within 24 hours to begin the conveyancing process.
                </p>
                <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Payment method selector */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pay with</p>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleMethodClick(m.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                        method === m.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {m.icon}
                      <span className={`text-xs ${method === m.id ? 'text-indigo-700 font-semibold' : 'text-gray-500'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Card details */}
                {(method === 'VISA' || method === 'MASTERCARD') && (
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Card number</label>
                      <div className="border border-gray-300 rounded-lg px-3 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
                        <input className="flex-1 text-sm outline-none placeholder-gray-300"
                          placeholder="1234 5678 9012 3456" maxLength={19}
                          value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))} />
                        {method === 'VISA'
                          ? <div className="bg-[#1A1F71] text-white text-xs font-extrabold px-1.5 py-0.5 rounded tracking-wider flex-shrink-0">VISA</div>
                          : <div className="flex flex-shrink-0"><div className="w-4 h-4 bg-[#EB001B] rounded-full"/><div className="w-4 h-4 bg-[#F79E1B] rounded-full -ml-1.5 opacity-90"/></div>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Expiry</label>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
                          placeholder="MM / YY" maxLength={7} value={card.expiry}
                          onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">CVC</label>
                        <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
                          placeholder="123" maxLength={4} value={card.cvc}
                          onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Name on card</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
                        placeholder="e.g. Jane Smith" value={card.name}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      Secured by <span className="font-semibold text-indigo-500 ml-0.5">Stripe</span> — PCI DSS compliant
                    </div>
                  </div>
                )}

                {/* PayPal */}
                {method === 'PAYPAL' && (
                  <div className="mb-5">
                    <div className="bg-[#FFC439] rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#f0b429] transition-colors">
                      <span className="text-sm font-bold"><span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span></span>
                      <span className="text-sm font-semibold text-[#003087]">Checkout</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">You'll complete payment securely on PayPal</p>
                  </div>
                )}

                {/* Crypto — real wallet connect */}
                {method === 'CRYPTO' && (
                  <div className="mb-5 p-4 bg-indigo-50 rounded-xl space-y-3">
                    {wallet.address ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-indigo-600 font-semibold">Wallet connected</p>
                            <p className="text-sm font-mono text-indigo-900">{wallet.address}</p>
                            {selectedCrypto && (
                              <p className="text-xs text-indigo-500 mt-0.5">
                                Paying in {CRYPTO_NAMES[selectedCrypto]} ({selectedCrypto})
                                {' · '}{CRYPTO_SYMBOLS[selectedCrypto]}{cryptoEquiv(price, selectedCrypto)}
                              </p>
                            )}
                          </div>
                          <button onClick={disconnect} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                            Disconnect
                          </button>
                        </div>
                        <div className="text-xs text-indigo-600 bg-indigo-100 rounded-lg p-2">
                          <p className="font-semibold mb-1">Send to trust wallet:</p>
                          {selectedCrypto === 'SOL' ? (
                            <p className="font-mono break-all">{OWNER_WALLETS.SOL}</p>
                          ) : selectedCrypto === 'ETH' ? (
                            <p className="font-mono break-all">{OWNER_WALLETS.ETH}</p>
                          ) : (
                            <p className="font-mono break-all">{OWNER_WALLETS.BTC}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowWalletModal(true)}
                        className="w-full py-3 border-2 border-dashed border-indigo-300 text-sm text-indigo-600 font-semibold rounded-xl hover:border-indigo-500 hover:bg-indigo-100 transition-colors"
                      >
                        + Connect Wallet
                      </button>
                    )}
                  </div>
                )}

                {/* Bank */}
                {method === 'BANK' && (
                  <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank transfer details</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">BSB</span><span className="font-mono font-semibold text-gray-900">062-000</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Account</span><span className="font-mono font-semibold text-gray-900">1234 5678</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-mono font-semibold text-gray-900">{listing.id.toUpperCase()}</span></div>
                    </div>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Purchase price</span>
                    <span className="font-semibold">${price.toLocaleString('en-AU')} AUD</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Platform fee (2%)</span>
                    <span className="font-semibold text-indigo-600">${fee.toLocaleString('en-AU')} AUD</span>
                  </div>
                  {method === 'CRYPTO' && selectedCrypto && (
                    <div className="flex justify-between text-sm text-indigo-600 mb-2">
                      <span>Crypto equivalent</span>
                      <span className="font-semibold">{CRYPTO_SYMBOLS[selectedCrypto]}{cryptoEquiv(price, selectedCrypto)} {selectedCrypto}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-base font-bold text-gray-900">
                    <span>Total payable</span>
                    <span>${price.toLocaleString('en-AU')} AUD</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Platform fee covers conveyancing coordination, escrow management & settlement support.</p>
                </div>

                {/* Confirm button */}
                <button
                  onClick={handleConfirm}
                  disabled={method === 'CRYPTO' && !wallet.address}
                  className="w-full py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  {method === 'VISA' || method === 'MASTERCARD' ? `Pay $${price.toLocaleString('en-AU')} AUD`
                    : method === 'PAYPAL' ? 'Continue to PayPal'
                    : method === 'CRYPTO' ? (wallet.address ? `Pay with ${selectedCrypto ?? 'Crypto'}` : 'Connect wallet to continue')
                    : "Confirm — I'll Transfer"}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  By continuing you agree to our Terms of Use. Settlement OS facilitates the coordination of this purchase.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
