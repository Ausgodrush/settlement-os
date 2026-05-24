# Settlement OS — Change Log

All changes are listed newest-first. Each entry shows what was changed, what was removed/before, and how to revert.

---

## 2026-05-25 — Investment pools, crypto wallet, portfolio, admin panel

### Summary
Integrated all investment features from `demo/index.html` into the Next.js app as proper pages and components. No real payment processing — demo only.

### New files

| File | Purpose |
|---|---|
| `src/lib/investData.ts` | 10 MOCK_POOLS, crypto constants (BTC/ETH/SOL prices), owner wallets, types |
| `src/lib/investStore.ts` | localStorage-backed state: pools, portfolio, wallet, platform fees |
| `src/hooks/useWallet.ts` | Wallet connection hook (MetaMask/Phantom/WalletConnect — mock) |
| `src/hooks/usePortfolio.ts` | Portfolio state + `usePools` hook |
| `src/components/invest/WalletConnectModal.tsx` | Wallet + crypto selection modal |
| `src/components/invest/CheckoutModal.tsx` | 5-method payment modal (Visa/MC/PayPal/Crypto/Bank) with fee summary |
| `src/app/invest/page.tsx` | Browse investment pools, filter by country/status, invest button |
| `src/app/portfolio/page.tsx` | Holdings list, crypto-equivalent view, projected returns (auth required) |
| `src/app/admin/page.tsx` | Platform revenue, trust wallet addresses, pool open/close controls (ADMIN only) |

### Modified files

- `src/components/layout/Sidebar.tsx` — Added **Invest** (public), **Portfolio** (auth), **Admin** (ADMIN role) nav items

### Business logic
- Platform fee: 2% on every investment (taken from investment amount, net goes to pool)
- Pool auto-status: `OPEN` → `FUNDED` when `amountRaised >= targetRaise`
- Crypto: BTC/ETH/SOL at fixed demo prices; `cryptoEquiv(aud, crypto)` converts AUD
- All state in localStorage; resets if localStorage is cleared

### To revert
Delete the 9 new files and revert `Sidebar.tsx` to remove the 3 new nav items.

---

## 2026-05-25 — Demo wrapper removed, code cleaned up

### Summary
Removed all `IS_DEMO` conditional branches. The demo-mode behaviour is now the permanent code path. Two preemptive bug fixes were also applied.

---

### `frontend/src/app/layout.tsx`

**Removed:**
```tsx
import { DemoBanner } from '@/components/DemoBanner';
const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
// inside RootLayout:
{false && <DemoBanner />}
```

**Now:** Plain layout — no banner, no IS_DEMO constant.

**To revert:** Add the import back, add `const IS_DEMO = ...`, add `{IS_DEMO && <DemoBanner />}` inside `<body>`.

---

### `frontend/src/app/page.tsx`

**Removed:**
- `const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'`
- Ternary in navbar: `{IS_DEMO ? <button>Sign in</button> : <Link href="/login">Sign in</Link>}`
- Ternary in hero CTAs: `{IS_DEMO ? <button>Manage deals</button> : <Link href="/login">Manage deals</Link>}`
- The non-demo branch of `handleSignIn` (`else { router.push('/login') }`)
- Renamed `attemptDemoLogin` → `attemptLogin`

**Now:** Sign-in button always calls `attemptLogin()` + `router.push('/dashboard')`.

**To revert:** Git checkout the previous commit for this file or re-add the IS_DEMO ternaries.

---

### `frontend/src/app/listings/page.tsx`

**Removed:**
- `const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'`
- Three-way ternary in navbar: `{isLoggedIn ? Dashboard : IS_DEMO ? <button> : <Link>}`
- The non-demo branch of `handleSignIn`
- Renamed `attemptDemoLogin` → `attemptLogin`

**Now:** Non-logged-in navbar always shows a Sign-in button that calls `attemptLogin()`.

---

### `frontend/src/app/login/page.tsx`

**Removed:**
- `const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'`
- `{IS_DEMO && <div>...demo accounts panel...</div>}` — panel is now always rendered
- `{IS_DEMO ? 'Demo environment — data resets on restart' : 'Protected by role-based access control'}` — footer now always shows demo text

**Now:** Demo accounts panel always visible. Footer always shows "Demo environment — data resets on restart".

---

### `frontend/src/lib/api.ts`

**Bug fixed (preemptive):** `window.location.href = '/login'` was called without checking if `window` exists. During static export (SSR/SSG) this would throw `ReferenceError: window is not defined`.

**Before:**
```ts
clearAuth();
window.location.href = '/login';
throw new ApiError(401, 'Session expired');
```

**After:**
```ts
clearAuth();
if (typeof window !== 'undefined') window.location.href = '/login';
throw new ApiError(401, 'Session expired');
```

Applied in two places: the pre-request token expiry check and the 401 retry handler.

---

### `frontend/src/hooks/useDeals.ts`

**Bug fixed (preemptive):** When `useDeals` runs on a page where the user is not logged in (e.g. Sidebar briefly on a public route), a 401 response was being stored in `error` state and surfaced to the UI.

**Before:**
```ts
} catch (e: any) {
  setError(e.message);
}
```

**After:**
```ts
} catch (e: any) {
  if (e?.status !== 401) setError(e.message);
}
```

---

## 2026-05-25 — Listing removals

- Removed **55 Norwood Parade** (AU-006) from `frontend/src/lib/mockListings.ts`
- Removed **22 O'Connell Street** (AU-005) from `frontend/src/lib/mockListings.ts`

**To revert:** Re-add the relevant object blocks to `mockListings.ts` and rebuild.

---

## 2026-05-25 — "Property Platform" text removed

Files changed: `layout.tsx`, `login/page.tsx`, `page.tsx`, `Sidebar.tsx`

- Browser tab title: `'Settlement OS — Property Platform'` → `'Settlement OS'`
- Landing page hero badge removed entirely
- Login page subtitle (`<p>Property Platform</p>`) removed
- Sidebar tagline: `'Property Platform'` → `'Settlement Platform'`

---

## 2026-05-24 — AU/ID filter tabs + status badges removed

- Removed `type Filter = 'ALL' | 'AU' | 'ID'` and filter tab UI from `listings/page.tsx`
- Removed `statusLabel`/`statusColor` badge from top-right of every listing card (both `page.tsx` and `listings/page.tsx`)

---

## 2026-05-24 — Rebrand BALIPROP → Settlement OS

Files changed: `page.tsx`, `layout.tsx`, `login/page.tsx`, `listings/page.tsx`

- All `BALIPROP` text replaced with `Settlement OS`
- Demo banner disabled (`{IS_DEMO && <DemoBanner />}` → `{false && <DemoBanner />}`)

---

## 2026-05-24 — Logo links to home, 12 listings, New Listing rename

- Sidebar logo wrapped in `<Link href="/">` (was plain `<div>`)
- `mockListings.ts` expanded from 6 → 11 properties (6 AU + 6 Bali, minus removals)
- Listings subtitle: "Australian and Bali property **settlements**" → "Australian and Bali property"
- "New Deal" renamed "New Listing" across: `dashboard/page.tsx`, `deals/page.tsx`, `conveyancer/page.tsx`, `deals/new/page.tsx`, `listings/page.tsx`, `Sidebar.tsx`

---

## 2026-05-23 — Public listings page, photos, Property Platform branding

- `/listings` page replaced `<Sidebar>` with a public navbar — no login required
- Landing page shows mock listing cards linking to `/listings`
- All "South Australian Property Settlement Platform" text replaced with "Property Platform"
- 6 mock listings with Unsplash photos added to `mockListings.ts`
- `backend/public/` rebuilt and committed for Hostinger deployment

---

## Git — how to revert any change

```bash
# See all commits
git log --oneline

# Revert a specific file to a previous commit
git checkout <commit-hash> -- frontend/src/app/page.tsx

# Revert everything to a specific commit (destructive)
git reset --hard <commit-hash>
```
