import type { MetadataRoute } from "next";
import { LISTINGS, listingPath, dbRowToListing, DbListingRow } from "@/lib/listings";
import { NEIGHBOURHOODS } from "@/lib/neighbourhoods";
import { AGENTS } from "@/lib/agents";
import { supabaseServer } from "@/lib/supabase-server";

const BASE = "https://mypropertyconnect.ng";
const MARKET = "ng";

// Without this, Next bakes the sitemap in at build time and new listings
// never appear until the next deploy — refresh hourly instead.
export const revalidate = 3600;

async function fetchDbListingsForSitemap(): Promise<{ path: string; updatedAt: string }[]> {
  try {
    const { data, error } = await supabaseServer
      .from("listings")
      .select("id, market_id, category_slug, title, neighbourhood, lga, state, price, period, beds, baths, toilets, status, created_at, updated_at")
      .eq("status", "active");
    if (error || !data) return [];
    return (data as (DbListingRow & { updated_at: string })[]).map((row) => ({
      path: listingPath(dbRowToListing(row)),
      updatedAt: row.updated_at ?? row.created_at,
    }));
  } catch {
    return [];
  }
}

async function fetchDbAgentSlugsForSitemap(): Promise<string[]> {
  try {
    const { data, error } = await supabaseServer
      .from("agent_profiles")
      .select("slug");
    if (error || !data) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
  } catch {
    return [];
  }
}

const CATEGORY_SLUGS = [
  "for-sale",
  "for-rent",
  "short-let",
  "office",
  "retail",
  "warehouse",
  "land",
  "event-venue",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [dbListings, dbAgentSlugs] = await Promise.all([
    fetchDbListingsForSitemap(),
    fetchDbAgentSlugsForSitemap(),
  ]);

  // Static top-level pages
  const statics: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/${MARKET}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE}/${MARKET}/for-sale`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE}/${MARKET}/for-rent`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE}/${MARKET}/short-let`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE}/${MARKET}/office`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE}/${MARKET}/retail`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/${MARKET}/warehouse`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/${MARKET}/land`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE}/${MARKET}/event-venue`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Individual listing pages — real DB listings plus the seed set used as
  // fallback content when the DB is empty.
  const seedListings: MetadataRoute.Sitemap = LISTINGS.map((l) => ({
    url: `${BASE}/${MARKET}/${listingPath(l)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const dbListingPages: MetadataRoute.Sitemap = dbListings.map((l) => ({
    url: `${BASE}/${MARKET}/${l.path}`,
    lastModified: new Date(l.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const listings = [...dbListingPages, ...seedListings];

  // Neighbourhood SEO pages — one per category × neighbourhood
  const neighbourhoodPages: MetadataRoute.Sitemap = NEIGHBOURHOODS.flatMap((nb) =>
    CATEGORY_SLUGS.map((cat) => ({
      url: `${BASE}/${MARKET}/${cat}/${nb.stateSlug}/${nb.lgaSlug}/${nb.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))
  );

  // Agent public profile pages — real DB agents plus the seed set.
  const agentSlugs = [
    ...dbAgentSlugs,
    ...AGENTS.map((a) => a.slug).filter((s) => !dbAgentSlugs.includes(s)),
  ];
  const agentPages: MetadataRoute.Sitemap = agentSlugs.map((slug) => ({
    url: `${BASE}/${MARKET}/agent/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...statics, ...listings, ...neighbourhoodPages, ...agentPages];
}
