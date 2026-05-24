import { InvestPool, PortfolioHolding, MOCK_POOLS, PLATFORM_FEE_RATE, CryptoSymbol, cryptoEquiv } from './investData';

const PORTFOLIO_KEY = 'psos_portfolio';
const WALLET_KEY = 'psos_wallet';
const FEES_KEY = 'psos_platform_fees';
const POOLS_KEY = 'psos_pools';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getPools(): InvestPool[] {
  const stored = safeGet<InvestPool[]>(POOLS_KEY, []);
  if (!stored.length) return MOCK_POOLS;
  return stored;
}

export function savePools(pools: InvestPool[]) {
  safeSet(POOLS_KEY, pools);
}

export function resetPools() {
  if (typeof window !== 'undefined') localStorage.removeItem(POOLS_KEY);
}

export interface WalletState {
  type: 'METAMASK' | 'PHANTOM' | 'WALLETCONNECT' | null;
  address: string | null;
  crypto: CryptoSymbol | null;
}

export function getWallet(): WalletState {
  return safeGet<WalletState>(WALLET_KEY, { type: null, address: null, crypto: null });
}

export function saveWallet(wallet: WalletState) {
  safeSet(WALLET_KEY, wallet);
}

export function disconnectWallet() {
  if (typeof window !== 'undefined') localStorage.removeItem(WALLET_KEY);
}

export function getPortfolio(): PortfolioHolding[] {
  return safeGet<PortfolioHolding[]>(PORTFOLIO_KEY, []);
}

export function getPlatformFees(): number {
  return safeGet<number>(FEES_KEY, 0);
}

export interface InvestResult {
  holding: PortfolioHolding;
  updatedPool: InvestPool;
  totalFees: number;
}

export function invest(
  pool: InvestPool,
  amountAUD: number,
  method: string,
  crypto: CryptoSymbol | null,
): InvestResult {
  const feeAUD = parseFloat((amountAUD * PLATFORM_FEE_RATE).toFixed(2));
  const netAmt = parseFloat((amountAUD - feeAUD).toFixed(2));

  const updatedPool: InvestPool = {
    ...pool,
    amountRaised: Math.min(pool.amountRaised + netAmt, pool.targetRaise),
    investorCount: pool.investorCount + 1,
  };
  if (updatedPool.amountRaised >= updatedPool.targetRaise) {
    updatedPool.status = 'FUNDED';
  }

  const holding: PortfolioHolding = {
    poolId: pool.id,
    poolName: pool.name,
    amount: amountAUD,
    netAmount: netAmt,
    feePaid: feeAUD,
    crypto: crypto,
    cryptoAmount: crypto ? cryptoEquiv(amountAUD, crypto) : null,
    date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    expectedYield: pool.expectedYield,
    location: pool.location,
  };

  const portfolio = getPortfolio();
  portfolio.push(holding);
  safeSet(PORTFOLIO_KEY, portfolio);

  const pools = getPools().map((p) => (p.id === pool.id ? updatedPool : p));
  savePools(pools);

  const prevFees = getPlatformFees();
  const newFees = parseFloat((prevFees + feeAUD).toFixed(2));
  safeSet(FEES_KEY, newFees);

  return { holding, updatedPool, totalFees: newFees };
}
