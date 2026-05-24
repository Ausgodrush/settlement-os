export type PoolStatus = 'OPEN' | 'FUNDED' | 'CLOSED';
export type CryptoSymbol = 'BTC' | 'ETH' | 'SOL';
export type PaymentMethod = 'VISA' | 'MASTERCARD' | 'PAYPAL' | 'CRYPTO' | 'BANK';

export interface InvestPool {
  id: string;
  listingId: string;
  name: string;
  location: string;
  country: 'AU' | 'ID';
  flag: string;
  targetRaise: number;
  amountRaised: number;
  minInvestment: number;
  expectedYield: number;
  term: number;
  investorCount: number;
  maxInvestors: number;
  payoutFrequency: string;
  status: PoolStatus;
  currency: string;
  imageUrl: string;
  propertyType: string;
  beds: number;
  baths: number;
  landSize?: string;
  description: string;
  features: string[];
}

export interface PortfolioHolding {
  poolId: string;
  poolName: string;
  amount: number;
  netAmount: number;
  feePaid: number;
  crypto: CryptoSymbol | null;
  cryptoAmount: string | null;
  date: string;
  expectedYield: number;
  location: string;
}

export const PLATFORM_FEE_RATE = 0.02;

export const CRYPTO_PRICES: Record<CryptoSymbol, number> = {
  BTC: 68420,
  ETH: 3518,
  SOL: 182,
};

export const CRYPTO_SYMBOLS: Record<CryptoSymbol, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  SOL: '◎',
};

export const CRYPTO_NAMES: Record<CryptoSymbol, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
};

export const OWNER_WALLETS = {
  AUD: 'BSB 062-000 · Acc 1234 5678 (Settlement OS Trust)',
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x742d35Cc6634C0532925a3b8D4C5f81a8c6E89bF',
  SOL: '9xKXBmA5UtE4vNXuBwM3p2qJzY7dR6fGhT1nCsWiPH',
};

export function cryptoEquiv(audAmount: number, crypto: CryptoSymbol): string {
  const val = audAmount / CRYPTO_PRICES[crypto];
  if (crypto === 'BTC') return val.toFixed(6);
  if (crypto === 'ETH') return val.toFixed(4);
  return val.toFixed(2);
}

export const MOCK_POOLS: InvestPool[] = [
  {
    id: 'p1',
    listingId: 'l1',
    name: 'Bondi Beachfront Fund',
    location: 'Bondi Beach, NSW',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 1075000,
    amountRaised: 645000,
    minInvestment: 10000,
    expectedYield: 8.1,
    term: 5,
    investorCount: 41,
    maxInvestors: 70,
    payoutFrequency: 'Quarterly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
    propertyType: '4BR Beachfront',
    beds: 4,
    baths: 3,
    landSize: '620m²',
    description: 'Premium beachfront property 50m from Bondi Beach. High tourist rental demand with consistent year-round occupancy.',
    features: ['Beachfront access', 'Private pool', 'Rooftop terrace', 'Full renovation 2024'],
  },
  {
    id: 'p2',
    listingId: 'l2',
    name: 'South Yarra Townhouse Syndicate',
    location: 'South Yarra, VIC',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 820000,
    amountRaised: 820000,
    minInvestment: 10000,
    expectedYield: 7.9,
    term: 7,
    investorCount: 52,
    maxInvestors: 52,
    payoutFrequency: 'Quarterly',
    status: 'FUNDED',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    propertyType: '3BR Townhouse',
    beds: 3,
    baths: 2,
    landSize: '410m²',
    description: 'Contemporary townhouse in one of Melbourne\'s most desirable inner suburbs. Strong capital growth corridor.',
    features: ['Inner suburb location', 'Heritage streetscape', 'Modern interior', 'Off-street parking'],
  },
  {
    id: 'p3',
    listingId: 'l3',
    name: 'Gold Coast Holiday Trust',
    location: 'Surfers Paradise, QLD',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 650000,
    amountRaised: 195000,
    minInvestment: 5000,
    expectedYield: 9.2,
    term: 3,
    investorCount: 18,
    maxInvestors: 50,
    payoutFrequency: 'Monthly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    propertyType: '2BR Holiday Apartment',
    beds: 2,
    baths: 2,
    description: 'High-yield holiday letting apartment steps from Surfers Paradise beach. Professional management included.',
    features: ['Beachside location', 'Resort facilities', 'Managed letting', 'Furnished'],
  },
  {
    id: 'p4',
    listingId: 'l4',
    name: 'Cottesloe Oceanfront Pool',
    location: 'Cottesloe, WA',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 1400000,
    amountRaised: 980000,
    minInvestment: 20000,
    expectedYield: 7.5,
    term: 7,
    investorCount: 37,
    maxInvestors: 55,
    payoutFrequency: 'Quarterly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
    propertyType: '5BR Ocean View',
    beds: 5,
    baths: 4,
    landSize: '890m²',
    description: 'Spectacular oceanfront property in Cottesloe. Uninterrupted Indian Ocean views with direct beach access.',
    features: ['Direct beach access', 'Private pool', 'Double garage', 'Solar & battery'],
  },
  {
    id: 'p5',
    listingId: 'l5',
    name: 'Norwood Residential Fund',
    location: 'Norwood, SA',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 560000,
    amountRaised: 336000,
    minInvestment: 7500,
    expectedYield: 7.2,
    term: 5,
    investorCount: 29,
    maxInvestors: 45,
    payoutFrequency: 'Quarterly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1505873242700-f289a29e1724?auto=format&fit=crop&w=600&q=80',
    propertyType: '3BR Heritage',
    beds: 3,
    baths: 2,
    landSize: '520m²',
    description: 'Beautifully restored heritage home in Adelaide\'s premium eastern suburb. Walking distance to The Parade.',
    features: ['Heritage character', 'Renovated kitchen', 'Rear studio', 'Leafy streetscape'],
  },
  {
    id: 'p6',
    listingId: 'l6',
    name: 'Salamanca Heritage Trust',
    location: 'Battery Point, TAS',
    country: 'AU',
    flag: '🇦🇺',
    targetRaise: 480000,
    amountRaised: 480000,
    minInvestment: 10000,
    expectedYield: 8.4,
    term: 10,
    investorCount: 32,
    maxInvestors: 32,
    payoutFrequency: 'Quarterly',
    status: 'FUNDED',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=600&q=80',
    propertyType: '2BR Heritage Cottage',
    beds: 2,
    baths: 1,
    description: 'Rare Georgian-era cottage near Salamanca Market. Strong short-stay performance with heritage premium.',
    features: ['Heritage listed', 'Salamanca precinct', 'Short-stay approved', 'Courtyard garden'],
  },
  {
    id: 'p7',
    listingId: 'l7',
    name: 'Canggu Surf Villa Fund',
    location: 'Canggu, Bali',
    country: 'ID',
    flag: '🇮🇩',
    targetRaise: 380000,
    amountRaised: 114000,
    minInvestment: 5000,
    expectedYield: 12.8,
    term: 3,
    investorCount: 12,
    maxInvestors: 40,
    payoutFrequency: 'Monthly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    propertyType: '3BR Private Villa',
    beds: 3,
    baths: 3,
    description: 'Stunning villa 200m from Echo Beach. Premium short-term rental in Bali\'s most sought-after surf locale.',
    features: ['Private pool', 'Open-plan bale', 'Walk to beach', 'Staff included'],
  },
  {
    id: 'p8',
    listingId: 'l8',
    name: 'Seminyak Boutique Pool',
    location: 'Seminyak, Bali',
    country: 'ID',
    flag: '🇮🇩',
    targetRaise: 520000,
    amountRaised: 468000,
    minInvestment: 10000,
    expectedYield: 11.5,
    term: 5,
    investorCount: 38,
    maxInvestors: 42,
    payoutFrequency: 'Monthly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
    propertyType: '4BR Luxury Villa',
    beds: 4,
    baths: 4,
    description: 'Architecturally designed villa in Seminyak\'s golden triangle. Consistent 80%+ occupancy year-round.',
    features: ['Infinity pool', 'Tropical garden', 'Full villa management', 'Western kitchen'],
  },
  {
    id: 'p9',
    listingId: 'l9',
    name: 'Uluwatu Clifftop Trust',
    location: 'Uluwatu, Bali',
    country: 'ID',
    flag: '🇮🇩',
    targetRaise: 720000,
    amountRaised: 288000,
    minInvestment: 15000,
    expectedYield: 13.2,
    term: 5,
    investorCount: 14,
    maxInvestors: 36,
    payoutFrequency: 'Quarterly',
    status: 'OPEN',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80',
    propertyType: '5BR Clifftop Villa',
    beds: 5,
    baths: 5,
    landSize: '2,100m²',
    description: 'Dramatic clifftop location with 270° Indian Ocean views. Boutique resort-style villa at Uluwatu.',
    features: ['Clifftop ocean views', 'Infinity edge pool', 'Cinema room', 'Helipad access'],
  },
  {
    id: 'p10',
    listingId: 'l10',
    name: 'Canggu Beachside Villa Fund',
    location: 'Canggu, Bali',
    country: 'ID',
    flag: '🇮🇩',
    targetRaise: 290000,
    amountRaised: 290000,
    minInvestment: 5000,
    expectedYield: 10.9,
    term: 3,
    investorCount: 35,
    maxInvestors: 35,
    payoutFrequency: 'Monthly',
    status: 'FUNDED',
    currency: 'AUD',
    imageUrl: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=600&q=80',
    propertyType: '2BR Beach Villa',
    beds: 2,
    baths: 2,
    description: 'Compact beachside villa ideal for couples. Fully funded and generating returns from month one.',
    features: ['Beach access', 'Private pool', 'Staff included', 'Airbnb Superhost'],
  },
];
