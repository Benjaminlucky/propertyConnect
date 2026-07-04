import { supabase } from "./supabase-client";
import { tokens, scoreAgainst, type SearchSuggestion } from "./search";
import { slugify } from "./listings";
import type { MarketId } from "./markets";

interface RawRow {
  id: number;
  title: string;
  neighbourhood: string;
  lga: string;
  state: string;
  price: number;
  period: string;
  category_slug: string;
}

export async function getDbSuggestions(
  query: string,
  marketId: MarketId,
): Promise<SearchSuggestion[]> {
  const needles = tokens(query);
  if (!needles.length) return [];

  const conditions = needles
    .flatMap((n) => [
      `title.ilike.%${n}%`,
      `neighbourhood.ilike.%${n}%`,
      `lga.ilike.%${n}%`,
      `state.ilike.%${n}%`,
      `category_slug.ilike.%${n}%`,
    ])
    .join(",");

  const { data } = await supabase
    .from("listings")
    .select("id, title, neighbourhood, lga, state, price, period, category_slug")
    .eq("market_id", marketId)
    .eq("status", "active")
    .or(conditions)
    .limit(20);

  if (!data?.length) return [];

  // Score each row by how many needles it matches
  const scored = (data as RawRow[])
    .map((row) => {
      let score = 0;
      score += scoreAgainst(row.title,         needles) * 3;
      score += scoreAgainst(row.neighbourhood,  needles) * 4;
      score += scoreAgainst(row.lga,            needles) * 2;
      score += scoreAgainst(row.state,          needles) * 1;
      score += scoreAgainst(row.category_slug,  needles) * 1;
      return { row, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return [];

  // Location suggestions (neighbourhood + state) — deduped
  const seen = new Set<string>();
  const locHits: SearchSuggestion[] = [];
  for (const { row } of scored) {
    const nbKey = `nb:${row.neighbourhood}`;
    const stKey = `st:${row.state}`;
    if (!seen.has(nbKey) && needles.some((n) => row.neighbourhood.toLowerCase().includes(n))) {
      seen.add(nbKey);
      locHits.push({
        type: "neighbourhood",
        label: row.neighbourhood,
        sub: `${row.lga} · ${row.state}`,
        href: `/${marketId}/for-sale/${slugify(row.state)}/${slugify(row.lga)}/${slugify(row.neighbourhood)}`,
      });
    }
    if (!seen.has(stKey) && needles.some((n) => row.state.toLowerCase().includes(n))) {
      seen.add(stKey);
      locHits.push({
        type: "state",
        label: row.state,
        sub: `All properties in ${row.state}`,
        href: `/${marketId}/for-sale/${slugify(row.state)}`,
      });
    }
  }

  // Individual listing suggestions (top 4 by score)
  const listingHits: SearchSuggestion[] = scored.slice(0, 4).map(({ row }) => {
    const price = `₦${Number(row.price).toLocaleString("en-NG")}`;
    const titleSlug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const href = `/${marketId}/${row.category_slug}/${slugify(row.state)}/${slugify(row.lga)}/${slugify(row.neighbourhood)}/${titleSlug}-${row.id}`;
    return {
      type: "listing",
      label: row.title,
      sub: `${row.neighbourhood} · ${price}${row.period ?? ""}`,
      href,
    };
  });

  return [...locHits.slice(0, 2), ...listingHits].slice(0, 6);
}
