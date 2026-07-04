import { LISTINGS, listingPath, Listing } from "./listings";
import type { MarketId } from "./markets";

export interface SearchResult {
  id: number;
  title: string;
  price: string;
  period: string;
  category: string;
  categorySlug: string;
  neighbourhood: string;
  lga: string;
  state: string;
  beds: number;
  verified: boolean;
  href: string;
  score: number;
  photo?: string;
}

export interface SearchSuggestion {
  type: "listing" | "neighbourhood" | "state";
  label: string;
  sub: string;
  href: string;
}

const POPULAR: SearchSuggestion[] = [
  { type: "neighbourhood", label: "Lekki Phase 1",  sub: "Lagos · For Sale & Rent",    href: "" },
  { type: "neighbourhood", label: "Maitama",         sub: "FCT Abuja · Premium homes", href: "" },
  { type: "neighbourhood", label: "Victoria Island", sub: "Lagos · Flats & Short-lets", href: "" },
  { type: "state",         label: "Lagos",           sub: "All properties in Lagos",    href: "" },
  { type: "state",         label: "FCT Abuja",       sub: "All properties in Abuja",    href: "" },
];

export function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

export function scoreAgainst(haystack: string, needles: string[]): number {
  const h = haystack.toLowerCase();
  return needles.reduce((acc, n) => {
    if (h.includes(n)) return acc + 1;
    return acc;
  }, 0);
}

export function searchListings(query: string, marketId: MarketId): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const needles = tokens(q);
  if (!needles.length) return [];

  const pool = LISTINGS.filter((l) => l.marketId === marketId);

  const scored = pool.map((l) => {
    let score = 0;
    score += scoreAgainst(l.title, needles) * 3;
    score += scoreAgainst(l.neighbourhood, needles) * 4;
    score += scoreAgainst(l.lga, needles) * 2;
    score += scoreAgainst(l.state, needles) * 1;
    score += scoreAgainst(l.category, needles) * 1;
    score += scoreAgainst(l.categorySlug, needles) * 1;
    /* Beds shorthand: "3 bed", "3bed", "3br" */
    const bedHints = needles.flatMap((n) => {
      const m = n.match(/^(\d)(bed|br|bedroom)?$/);
      return m ? [Number(m[1])] : [];
    });
    if (bedHints.length && bedHints.includes(l.beds)) score += 3;
    return { l, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ l, score }) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      period: l.period,
      category: l.category,
      categorySlug: l.categorySlug,
      neighbourhood: l.neighbourhood,
      lga: l.lga,
      state: l.state,
      beds: l.beds,
      verified: l.verified,
      href: `/${marketId}/${listingPath(l)}`,
      score,
      photo: l.photos?.[0],
    }));
}

export function getSuggestions(
  query: string,
  marketId: MarketId,
): SearchSuggestion[] {
  const q = query.trim();
  if (!q) return POPULAR;
  const needles = tokens(q);

  const listingHits = searchListings(q, marketId).slice(0, 4).map(
    (r): SearchSuggestion => ({
      type: "listing",
      label: r.title,
      sub: `${r.neighbourhood} · ${r.price}${r.period}`,
      href: r.href,
    }),
  );

  /* Neighbourhood & state suggestions from matching listings */
  const seen = new Set<string>();
  const locHits: SearchSuggestion[] = [];
  LISTINGS.filter((l) => l.marketId === marketId).forEach((l) => {
    const nbKey = `nb:${l.neighbourhood}`;
    const stKey = `st:${l.state}`;
    if (!seen.has(nbKey) && needles.some((n) => l.neighbourhood.toLowerCase().includes(n))) {
      seen.add(nbKey);
      locHits.push({
        type: "neighbourhood",
        label: l.neighbourhood,
        sub: `${l.lga} · ${l.state}`,
        href: `/${marketId}/for-sale/${l.state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${l.lga.toLowerCase().replace(/\s+/g, "-")}/${l.neighbourhood.toLowerCase().replace(/\s+/g, "-")}`,
      });
    }
    if (!seen.has(stKey) && needles.some((n) => l.state.toLowerCase().includes(n))) {
      seen.add(stKey);
      locHits.push({
        type: "state",
        label: l.state,
        sub: `All properties in ${l.state}`,
        href: `/${marketId}/for-sale/${l.state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      });
    }
  });

  return [...locHits.slice(0, 2), ...listingHits].slice(0, 6);
}

export const RECENT_KEY = "pc_recent_searches";

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch { return []; }
}

export function addRecentSearch(q: string): void {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((r) => r !== q).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...recent]));
}
