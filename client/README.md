# MyPropConnect NG — Next.js shell (frontend, multitenant-first)

Real Next.js 16 (App Router, TypeScript, Tailwind v4) scaffold. Frontend-first,
mock data, designed so swapping in the real API is a substitution, not a rewrite.

## Run
```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /ng
```
Key routes: `/ng` (market home), `/ng/list` (adaptive 8-category listing form).

## The multitenant ("market") seam
- `lib/markets.ts` — market registry. A market is the tenant boundary; every
  listing/agent/enquiry row carries `marketId`. Nigeria is live; Ghana is
  pre-seeded but `live:false` to prove expansion needs a row, not a migration.
- `middleware.ts` — resolves the market from hostname or first path segment and
  rewrites bare paths to the default market. (Next 16 note: rename to
  `proxy.ts` per the deprecation warning — same code, new filename.)
- Every route is `app/[market]/...` and resolves the tenant server-side.
- Users never see "tenant" — only the "🇳🇬 Nigeria · Lagos" pill.

## The adaptive listing form (core differentiator)
- `lib/categories.ts` — the 8 categories + per-category field definitions.
  Category-specific fields map to the EAV `listing_attributes` table, so adding
  a field never means an ALTER TABLE.
- `components/ListingForm.tsx` — multi-step form that renders only the fields
  for the chosen category; live quality score + AI price hint; the review step
  shows the SEO URL and the `marketId` stamp on the draft.

## Restore production fonts before shipping
`app/layout.tsx` uses system-font fallbacks ONLY because the build sandbox
blocked Google Fonts. Restore `next/font` (Fraunces + Inter) — the CSS
variables are unchanged, so it's a drop-in.

## Next build passes
Port the three prototype pages (home/search, results, listing detail) into
`app/[market]/...` server components; agent dashboard; agent profile (SSR,
schema.org); programmatic neighbourhood pages.
