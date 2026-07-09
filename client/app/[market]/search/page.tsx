import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Search, MapPin, Building2 } from "lucide-react";
import { getMarket } from "@/lib/markets";
import { searchListings, type SearchResult } from "@/lib/search";
import { searchDbListings } from "@/lib/search-server";
import { parseFilter, type ListingFilter } from "@/lib/listings";
import { Seal } from "@/components/Seal";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import "../home.css";

type Params = { market: string };
type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const [{ market: slug }, sp] = await Promise.all([params, searchParams]);
  const q = typeof sp.q === "string" ? sp.q : "";
  return {
    title: q
      ? `"${q}" — Property search results | MyPropertyConnect`
      : "Search properties | MyPropertyConnect",
    description: q
      ? `Search results for "${q}" across all property listings in Nigeria. Browse verified properties on MyPropertyConnect.`
      : "Search properties across Nigeria on MyPropertyConnect.",
  };
}

const CAT_ORDER = ["For Sale", "For Rent", "Short-let", "Office", "Retail", "Warehouse", "Land", "Events"];

function groupByCategory(results: SearchResult[]): { category: string; items: SearchResult[] }[] {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    const arr = map.get(r.category) ?? [];
    arr.push(r);
    map.set(r.category, arr);
  }
  return CAT_ORDER
    .filter((c) => map.has(c))
    .map((c) => ({ category: c, items: map.get(c)! }));
}

function applySearchFilters(results: SearchResult[], f: ListingFilter): SearchResult[] {
  let out = results.filter((r) => {
    const raw = Number(r.price.replace(/[^\d]/g, ""));
    if (f.beds     && r.beds < f.beds) return false;
    if (f.minPrice && raw < f.minPrice) return false;
    if (f.maxPrice && raw > f.maxPrice) return false;
    if (f.verified && !r.verified)     return false;
    return true;
  });
  if (f.sort === "price_asc")  out = [...out].sort((a, b) => Number(a.price.replace(/[^\d]/g, "")) - Number(b.price.replace(/[^\d]/g, "")));
  if (f.sort === "price_desc") out = [...out].sort((a, b) => Number(b.price.replace(/[^\d]/g, "")) - Number(a.price.replace(/[^\d]/g, "")));
  return out;
}

const POPULAR_QUERIES = [
  "3 bedroom Lekki",
  "2 bed flat Lagos",
  "duplex Abuja",
  "land for sale",
  "short let Victoria Island",
  "office space Lekki",
];

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const [{ market: slug }, sp] = await Promise.all([params, searchParams]);
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const filter = parseFilter(sp);

  // Run seed + DB searches in parallel; merge with DB results first
  const [seedResults, dbResults] = q
    ? await Promise.all([
        Promise.resolve(searchListings(q, market.id)),
        searchDbListings(q, market.id),
      ])
    : [[], []];

  // Deduplicate: DB results take priority; drop seed entries with same id
  const dbIds = new Set(dbResults.map((r) => r.id));
  const merged = [
    ...dbResults,
    ...seedResults.filter((r) => !dbIds.has(r.id)),
  ].sort((a, b) => b.score - a.score);

  const total = merged.length;
  const results = applySearchFilters(merged, filter);
  const groups = groupByCategory(results);

  const baseParams = q ? { q } : undefined;

  return (
    <>
      <SiteHeader market={market} />
      <div className="sr-page">
          <div className="sr-head">
            <div className="sr-crumbs">
              <Link href={`/${market.slug}`}>Home</Link>
              <span className="sr-crumbs-sep">›</span>
              <span>Search</span>
              {q && (
                <>
                  <span className="sr-crumbs-sep">›</span>
                  <span>&quot;{q}&quot;</span>
                </>
              )}
            </div>

            {q ? (
              <>
                <h1 className="sr-title">
                  Results for <em>&ldquo;{q}&rdquo;</em>
                </h1>
                <p className="sr-meta">
                  {total === 0
                    ? "No listings found"
                    : `${total} listing${total === 1 ? "" : "s"} matched`}
                </p>
              </>
            ) : (
              <h1 className="sr-title">Search properties</h1>
            )}
            <div className="sr-refine">
              <SearchBar
                marketId={market.id}
                marketSlug={market.slug}
                placeholder="Refine your search…"
              />
            </div>
          </div>

          {/* Filter bar — only show when there's a query */}
          {q && (
            <div className="home">
              <FilterBar
                filter={filter}
                showBeds={true}
                total={total}
                filtered={results.length}
                baseParams={baseParams}
                sortByRelevance={true}
              />
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            groups.map(({ category, items }) => (
              <div className="sr-group" key={category}>
                <div className="sr-group-head">
                  <div className="sr-group-label">
                    {category}
                  </div>
                  <span className="sr-group-ct">
                    {items.length} result{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="sr-cards">
                  {items.map((r) => (
                    <SearchResultCard key={r.id} result={r} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="sr-empty">
              <div className="sr-empty-icon">
                <Search size={28} strokeWidth={1.5} />
              </div>
              {q && total > 0 ? (
                <>
                  <div className="sr-empty-title">No results match your filters</div>
                  <p className="sr-empty-sub">
                    {total} listing{total === 1 ? "" : "s"} matched &ldquo;{q}&rdquo; but none pass the current filters. Try adjusting price, bedrooms, or clearing filters.
                  </p>
                </>
              ) : q ? (
                <>
                  <div className="sr-empty-title">No results for &ldquo;{q}&rdquo;</div>
                  <p className="sr-empty-sub">
                    Try a neighbourhood name, property type, or number of bedrooms —
                    e.g. &ldquo;3 bed Lekki&rdquo; or &ldquo;duplex Abuja&rdquo;.
                  </p>
                </>
              ) : (
                <>
                  <div className="sr-empty-title">What are you looking for?</div>
                  <p className="sr-empty-sub">
                    Search by neighbourhood, property type, bedrooms, or price range.
                  </p>
                </>
              )}
              <div className="sr-suggestions">
                {POPULAR_QUERIES.map((pq) => (
                  <Link
                    key={pq}
                    href={`/${market.slug}/search?q=${encodeURIComponent(pq)}`}
                    className="sr-suggestion-chip"
                  >
                    <Search size={12} strokeWidth={2} />
                    {pq}
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
      <SiteFooter market={market} />
    </>
  );
}

function cloudThumb(url: string) {
  return url.replace("/upload/", "/upload/w_480,h_360,c_fill/");
}

function SearchResultCard({ result: r }: { result: SearchResult }) {
  return (
    <Link href={r.href} className="sr-card">
      <div className="sr-card-thumb">
        {r.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudThumb(r.photo)}
            alt={r.title}
            className="sr-card-img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="sr-card-placeholder">
            <Building2 size={28} strokeWidth={1.5} />
          </div>
        )}
        <span className="sr-card-cat">{r.category}</span>
        {r.verified && (
          <span className="sr-card-verified">
            <Seal size={22} />
          </span>
        )}
      </div>
      <div className="sr-card-body">
        <div className="sr-card-price">
          {r.price}
          {r.period && <span>{r.period}</span>}
        </div>
        <div className="sr-card-title">{r.title}</div>
        <div className="sr-card-loc">
          <MapPin size={12} strokeWidth={1.8} />
          {r.neighbourhood}, {r.state}
          {r.beds > 0 && <span className="sr-card-beds">{r.beds} bed</span>}
        </div>
      </div>
    </Link>
  );
}
