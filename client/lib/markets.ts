/**
 * The tenant seam.
 *
 * A "market" is our tenant boundary. Every listing, agent, enquiry and
 * neighbourhood row carries a `marketId`. One codebase + one database serves
 * Nigeria today; adding Ghana or splitting a region into its own market later
 * is a new row here plus data — never a migration and never a redeploy.
 *
 * Users never see the word "tenant". They see "Nigeria". The slug is the first
 * path segment of every URL: /ng/for-sale/lagos/eti-osa/lekki/...
 */

export type MarketId = string;

export interface Market {
  id: MarketId;
  slug: string; // URL segment, e.g. "ng"
  country: string; // "Nigeria"
  flag: string; // emoji, UI only
  currency: string; // ISO 4217, e.g. "NGN"
  currencySymbol: string; // "₦"
  locale: string; // "en-NG"
  defaultCity: string; // kept for data/formatting; not shown as a default filter
  domains: string[]; // hostnames that should resolve to this market
  live: boolean; // false markets are scaffolded but not yet launched
}

export const MARKETS: Record<MarketId, Market> = {
  ng: {
    id: "ng",
    slug: "ng",
    country: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    defaultCity: "Lagos",
    domains: ["propconnectng.com", "www.propconnectng.com"],
    live: true,
  },
  // Pre-seeded, not launched. Proves the seam holds for expansion.
  gh: {
    id: "gh",
    slug: "gh",
    country: "Ghana",
    flag: "🇬🇭",
    currency: "GHS",
    currencySymbol: "₵",
    locale: "en-GH",
    defaultCity: "Accra",
    domains: ["propconnect.com.gh"],
    live: false,
  },
};

export const DEFAULT_MARKET: MarketId = "ng";

export function getMarket(slug: string | undefined): Market | null {
  if (!slug) return null;
  const m = MARKETS[slug.toLowerCase()];
  return m ?? null;
}

export function getMarketByHost(host: string | undefined): Market | null {
  if (!host) return null;
  const bare = host.split(":")[0].toLowerCase();
  return Object.values(MARKETS).find((m) => m.domains.includes(bare)) ?? null;
}

export function liveMarkets(): Market[] {
  return Object.values(MARKETS).filter((m) => m.live);
}

/** Format a price in a market's currency without trailing decimals. */
export function formatPrice(market: Market, amount: number): string {
  return `${market.currencySymbol}${amount.toLocaleString(market.locale)}`;
}
