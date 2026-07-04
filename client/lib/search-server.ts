import { supabaseServer } from "./supabase-server";
import { dbRowToListing, listingPath, DbListingRow } from "./listings";
import { tokens, scoreAgainst, SearchResult } from "./search";

export async function searchDbListings(
  query: string,
  marketId: string,
): Promise<SearchResult[]> {
  const needles = tokens(query);
  if (!needles.length) return [];

  // Build OR conditions so any row matching ANY token in ANY key field is returned.
  // Client-side scoring then ranks by how many tokens actually match.
  const conditions = needles
    .flatMap((n) => [
      `title.ilike.%${n}%`,
      `neighbourhood.ilike.%${n}%`,
      `lga.ilike.%${n}%`,
      `state.ilike.%${n}%`,
      `description.ilike.%${n}%`,
      `category_slug.ilike.%${n}%`,
    ])
    .join(",");

  try {
    const { data, error } = await supabaseServer
      .from("listings")
      .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
      .eq("market_id", marketId)
      .eq("status", "active")
      .or(conditions)
      .limit(60);

    if (error || !data) return [];

    const bedHints = needles.flatMap((n) => {
      const m = n.match(/^(\d+)(bed|br|bedroom)?$/);
      return m ? [Number(m[1])] : [];
    });

    return (data as DbListingRow[])
      .map((row) => {
        const l = dbRowToListing(row);
        let score = 0;
        score += scoreAgainst(l.title, needles) * 3;
        score += scoreAgainst(l.neighbourhood, needles) * 4;
        score += scoreAgainst(l.lga, needles) * 2;
        score += scoreAgainst(l.state, needles) * 1;
        score += scoreAgainst(l.category, needles) * 1;
        score += scoreAgainst(l.categorySlug, needles) * 1;
        if (bedHints.length && bedHints.includes(l.beds)) score += 3;
        return { l, score };
      })
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
  } catch {
    return [];
  }
}
