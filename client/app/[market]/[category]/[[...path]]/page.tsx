import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMarket, Market } from "@/lib/markets";
import { CATEGORIES, CategoryId } from "@/lib/categories";
import {
  listingsForMarket,
  getListing,
  detailFor,
  idFromSlug,
  listingPath,
  parseFilter,
  applyFilters,
  slugify,
  dbRowToListing,
  DbListingRow,
  Listing,
} from "@/lib/listings";
import { supabaseServer } from "@/lib/supabase-server";
import { getNeighbourhood } from "@/lib/neighbourhoods";
import { ListingCard } from "@/components/ListingCard";
import { FilterBar } from "@/components/FilterBar";
import { NeighbourhoodHeader } from "@/components/NeighbourhoodHeader";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Seal } from "@/components/Seal";
import { EnquiryPanel } from "@/components/EnquiryPanel";
import "../../home.css";
import "../../enquiry.css";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ViewTracker } from "@/components/ViewTracker";
import { PhotoGallery } from "@/components/PhotoGallery";
import { geocodeNigeria } from "@/lib/geocode";

type Params = { market: string; category: string; path?: string[] };
type SP = Record<string, string | string[] | undefined>;

function resolve(params: { market: string; category: string; path?: string[] }) {
  const market = getMarket(params.market);
  if (!market || !market.live) return null;
  const category = CATEGORIES[params.category as CategoryId];
  if (!category) return null;
  const path = params.path ?? [];
  const last = path[path.length - 1];
  const id = last ? idFromSlug(last) : null;
  return { market, category, path, id };
}

async function fetchDbListings(marketId: string, categorySlug: string): Promise<Listing[]> {
  try {
    const { data, error } = await supabaseServer
      .from("listings")
      .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
      .eq("market_id", marketId)
      .eq("category_slug", categorySlug)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbListingRow[]).map(dbRowToListing);
  } catch {
    return [];
  }
}

async function fetchDbListing(id: number): Promise<Listing | null> {
  try {
    const { data, error } = await supabaseServer
      .from("listings")
      .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle();
    if (error || !data) return null;
    return dbRowToListing(data as DbListingRow);
  } catch {
    return null;
  }
}

// Fetch candidate pool for similar listings: same category, up to 20 from DB
async function fetchSimilarCandidates(l: Listing): Promise<Listing[]> {
  try {
    const { data } = await supabaseServer
      .from("listings")
      .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
      .eq("market_id", l.marketId)
      .eq("category_slug", l.categorySlug)
      .eq("status", "active")
      .neq("id", l.id)
      .limit(20);
    return data ? (data as DbListingRow[]).map(dbRowToListing) : [];
  } catch {
    return [];
  }
}

function scoreSimilarity(target: Listing, candidate: Listing): number {
  let score = 0;
  if (candidate.state        === target.state)        score += 3;
  if (candidate.lga          === target.lga)          score += 4;
  if (candidate.neighbourhood === target.neighbourhood) score += 5;
  if (target.beds > 0 && candidate.beds > 0) {
    const diff = Math.abs(target.beds - candidate.beds);
    if (diff === 0) score += 2;
    else if (diff === 1) score += 1;
  }
  return score;
}

function buildSimilarListings(target: Listing, dbCandidates: Listing[], marketId: string): Listing[] {
  const dbIds = new Set(dbCandidates.map((c) => c.id));
  const seedCandidates = listingsForMarket(marketId).filter(
    (s) => s.categorySlug === target.categorySlug && s.id !== target.id && !dbIds.has(s.id),
  );
  return [...dbCandidates, ...seedCandidates]
    .map((c) => ({ listing: c, score: scoreSimilarity(target, c) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ listing }) => listing);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const r = resolve(await params);
  if (!r) return {};
  if (r.id) {
    const l = getListing(r.id);
    if (l)
      return {
        title: `${l.title} — ${l.neighbourhood}, ${l.state} | PropertyConnect`,
        description: l.title,
      };
  }
  // Neighbourhood-depth SEO metadata
  if (r.path.length >= 3) {
    const nhSlug = r.path[2];
    const nh = getNeighbourhood(nhSlug);
    if (nh) {
      return {
        title: `${r.category.label} in ${nh.name}, ${nh.lga} — ${nh.state} | PropertyConnect`,
        description: `${nh.description.split(".")[0]}. Browse verified ${r.category.label.toLowerCase()} listings in ${nh.name}, ${nh.lga}. PropertyConnect — list free, find fast.`,
      };
    }
  }
  const where = r.path
    .filter((s) => s !== "nigeria")
    .map((s) => titleCase(s))
    .join(", ");
  return {
    title: `${r.category.label}${where ? " in " + where : " across Nigeria"} | PropertyConnect`,
    description: `Browse verified ${r.category.label.toLowerCase()} listings${where ? " in " + where : " across Nigeria"}. Free to list. Fast to find. PropertyConnect.`,
  };
}

export default async function CategoryRoute({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SP>;
}) {
  const [resolvedParams, sp] = await Promise.all([params, searchParams]);
  const r = resolve(resolvedParams);
  if (!r) notFound();
  const { market, category, path, id } = r;

  // ---- DETAIL ----
  if (id !== null) {
    let l: Listing | null | undefined = getListing(id);
    if (!l) l = await fetchDbListing(id);
    if (!l) notFound();
    return <Detail listing={l} marketSlug={market.slug} market={market} />;
  }

  // ---- RESULTS ----
  const filter = parseFilter(sp);
  const nationwide = path.length === 0 || path[0] === "nigeria";
  const locPath = nationwide ? [] : path;

  // Neighbourhood detection — path depth 3: [stateSlug, lgaSlug, neighbourhoodSlug]
  const isNeighbourhood = !nationwide && locPath.length >= 3;
  const neighbourhood = isNeighbourhood ? getNeighbourhood(locPath[2]) : null;

  // Fetch DB listings and merge with seed listings (DB first, no ID duplication)
  const [dbListings, seedListings] = await Promise.all([
    fetchDbListings(market.id, category.id),
    Promise.resolve(
      listingsForMarket(market.id).filter((l) => l.categorySlug === category.id)
    ),
  ]);
  const dbIds = new Set(dbListings.map((l) => l.id));
  const allMarketListings = [
    ...dbListings,
    ...seedListings.filter((l) => !dbIds.has(l.id)),
  ];

  const pool = allMarketListings.filter((l) => {
    if (nationwide) return true;
    if (slugify(l.state) !== locPath[0]) return false;
    if (locPath.length >= 2 && slugify(l.lga) !== locPath[1]) return false;
    if (locPath.length >= 3 && slugify(l.neighbourhood) !== locPath[2]) return false;
    return true;
  });

  // Total listings in this neighbourhood across all categories (for demand signal)
  const allInArea = isNeighbourhood
    ? allMarketListings.filter(
        (l) =>
          slugify(l.state) === locPath[0] &&
          slugify(l.lga) === locPath[1] &&
          slugify(l.neighbourhood) === locPath[2],
      ).length
    : 0;

  // Apply search filters
  const results = applyFilters(pool, filter);

  const crumbWhere = locPath.map((seg, i) => ({
    label: titleCase(seg),
    href: `/${market.slug}/${category.id}/${locPath.slice(0, i + 1).join("/")}`,
  }));
  const place = nationwide ? "Nigeria" : titleCase(locPath[locPath.length - 1]);
  const seoUrl = `propertyconnect.ng/${category.id}/${path.join("/") || "nigeria"}`;

  const sortLabel =
    filter.sort === "price_asc" ? "price: low → high"
    : filter.sort === "price_desc" ? "price: high → low"
    : "newest first";

  return (
    <>
      <SiteHeader market={market} />
      <div className="home">
        <div className="wrap">
          <div className="crumbs">
            <Link href={`/${market.slug}`}>Home</Link>
            <span className="sep">›</span>
            <Link href={`/${market.slug}/${category.id}/nigeria`}>
              {category.label}
            </Link>
            {crumbWhere.map((c) => (
              <span key={c.href}>
                <span className="sep">›</span>
                <Link href={c.href}>{c.label}</Link>
              </span>
            ))}
          </div>
          <div className="urlbar">{seoUrl}</div>
        </div>

        <div className="wrap results">
          <div>
            {/* Neighbourhood landing page header — shown at depth ≥ 3 */}
            {isNeighbourhood && neighbourhood ? (
              <NeighbourhoodHeader
                neighbourhood={neighbourhood}
                category={category}
                marketSlug={market.slug}
                listings={pool}
                allInArea={allInArea}
              />
            ) : (
              <div className="res-head">
                <div>
                  <h1>
                    {category.label}{" "}
                    {nationwide ? "across Nigeria" : `in ${place}`}
                  </h1>
                  <div className="ct">
                    {results.length} listing{results.length === 1 ? "" : "s"} ·{" "}
                    {sortLabel}
                  </div>
                </div>
              </div>
            )}

            <FilterBar
              filter={filter}
              showBeds={category.showRooms}
              total={pool.length}
              filtered={results.length}
            />

            <div className="res-cards">
              {results.length ? (
                results.map((l) => (
                  <ListingCard key={l.id} listing={l} marketSlug={market.slug} />
                ))
              ) : (
                <p className="res-empty">
                  No listings match your filters. Try broadening your search, or{" "}
                  <Link href={`/${market.slug}/list`}>list one free</Link>.
                </p>
              )}
            </div>
          </div>

          <div className="map">
            <div className="mlabel">
              {results.length} listing{results.length === 1 ? "" : "s"} in this area
            </div>
            {results.slice(0, 6).map((l, i) => (
              <div
                key={l.id}
                className={"pin" + (i === 0 ? " hot" : "")}
                style={{
                  left: `${20 + ((i * 53) % 60)}%`,
                  top: `${28 + ((i * 37) % 50)}%`,
                }}
              >
                {compactPrice(l)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <SiteFooter market={market} />
    </>
  );
}

async function Detail({
  listing: l,
  marketSlug,
  market,
}: {
  listing: Listing;
  marketSlug: string;
  market: Market;
}) {
  const d = detailFor(l.id);
  const isDbListing = l.id < 1_000_000;

  // Valuation: DB listings read from the stored row; seed listings from LISTING_DETAIL
  const valuationLow  = isDbListing ? l.valuationLow  : (d.valuationLow  !== "—" ? d.valuationLow  : undefined);
  const valuationHigh = isDbListing ? l.valuationHigh : (d.valuationHigh !== "—" ? d.valuationHigh : undefined);
  const valuationNote = isDbListing ? l.valuationNote : (d.valuationNote  || undefined);

  const [geo, dbCandidates] = await Promise.all([
    geocodeNigeria(l.neighbourhood, l.lga, l.state),
    fetchSimilarCandidates(l),
  ]);
  const similar = buildSimilarListings(l, dbCandidates, l.marketId);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const description = l.description ?? d.description;
  const ld = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: l.title,
    url: `https://propertyconnect.ng/${listingPath(l)}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: l.neighbourhood,
      addressRegion: l.state,
      addressCountry: "NG",
    },
    offers: {
      "@type": "Offer",
      price: l.price.replace(/[^\d]/g, ""),
      priceCurrency: market.currency,
    },
    numberOfRooms: l.beds,
  };
  return (
    <>
      <SiteHeader market={market} />
      <ViewTracker listingId={l.id} />
      <div className="home">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
        <div className="wrap">
          <div className="crumbs">
            <Link href={`/${marketSlug}`}>Home</Link>
            <span className="sep">›</span>
            <Link href={`/${marketSlug}/${l.categorySlug}/nigeria`}>
              {l.category}
            </Link>
            <span className="sep">›</span>
            {l.state} <span className="sep">›</span> {l.lga}{" "}
            <span className="sep">›</span> {l.neighbourhood}
          </div>
          <div className="urlbar">propertyconnect.ng/{listingPath(l)}</div>
          {l.photos && l.photos.length > 0 ? (
            <PhotoGallery photos={l.photos} title={l.title} />
          ) : (
            <div className="det-gal">
              <div className="g"><span className="imgtxt">Living area</span></div>
              <div className="g"><span className="imgtxt">Kitchen</span></div>
              <div className="g"><span className="imgtxt">Master bedroom</span></div>
              <div className="g"><span className="imgtxt">Exterior</span></div>
              <div className="g more">+ 18 photos · 360° tour</div>
            </div>
          )}
        </div>

        <div className="wrap det">
          <div>
            <h1>{l.title}</h1>
            <div
              style={{
                color: "var(--clay)",
                fontSize: 14.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              📍 {l.neighbourhood}, {l.lga}, {l.state}
            </div>
            <div className="price-lg">
              {l.price} {d.pricePerSqm && <span>· {d.pricePerSqm}</span>}
              {l.period && <span>{l.period}</span>}
            </div>
            <span className="seal-row">
              <Seal size={20} /> Verified listing · ID-checked agent · photos
              screened
            </span>

            <div className="specbar">
              {l.beds > 0 && (
                <>
                  <div className="s">
                    <b>{l.beds}</b>
                    <small>Bedrooms</small>
                  </div>
                  <div className="s">
                    <b>{l.baths}</b>
                    <small>Bathrooms</small>
                  </div>
                  <div className="s">
                    <b>{l.toilets}</b>
                    <small>Toilets</small>
                  </div>
                </>
              )}
              {d.sqm && (
                <div className="s">
                  <b>{d.sqm}</b>
                  <small>sqm</small>
                </div>
              )}
              {d.parking != null && (
                <div className="s">
                  <b>{d.parking}</b>
                  <small>Parking</small>
                </div>
              )}
            </div>

            <h3 className="sub">About this property</h3>
            <p className="desc">{description}</p>

            {d.attrs.length > 0 && (
              <>
                <h3 className="sub">Property details</h3>
                <div className="attrs">
                  {d.attrs.map((a) => (
                    <div className="a" key={a.k}>
                      <span>{a.k}</span>
                      <b>{a.v}</b>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Location map ── */}
            <div className="det-map-section">
              <h3 className="sub">Location</h3>
              {geo && mapboxToken ? (
                <div className="det-map">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+2d6a4f(${geo.lng},${geo.lat})/${geo.lng},${geo.lat},14/640x320@2x?access_token=${mapboxToken}`}
                    alt={`Map showing ${l.neighbourhood}, ${l.state}`}
                    className="det-map-img"
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={320}
                  />
                  <div className="det-map-caption">
                    📍 Approximate location · {l.neighbourhood}, {l.lga}, {l.state}
                  </div>
                </div>
              ) : (
                <div className="det-map det-map--fallback">
                  <div className="det-map-fallback-pin">📍</div>
                  <div className="det-map-fallback-body">
                    <span className="det-map-fallback-nb">{l.neighbourhood}</span>
                    <span className="det-map-fallback-sub">{l.lga} · {l.state} · Nigeria</span>
                  </div>
                </div>
              )}
            </div>

            <div className="share-row">
              <span className="share-label">Share</span>
              <a
                className="share-btn share-btn--wa"
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${l.title} — ${l.neighbourhood}, ${l.state}\n${l.price}${l.period}\nhttps://propertyconnect.ng/${listingPath(l)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <CopyLinkButton url={`https://propertyconnect.ng/${listingPath(l)}`} />
            </div>
          </div>

          <aside className="aside">
            <div className="agentcard">
              <div className="top">
                <Link href={`/${marketSlug}/agent/${l.agentSlug}`} className="av av--link">{l.agentInitials}</Link>
                <div>
                  <div className="nm">
                    <Link href={`/${marketSlug}/agent/${l.agentSlug}`} className="agent-name-link">
                      {l.agent}
                    </Link>{" "}
                    {l.verified && <Seal size={18} />}
                  </div>
                  {d.agentMeta && (
                    <div className="meta">
                      {d.agentMeta} · {d.agentYears} yrs
                    </div>
                  )}
                  {d.agentRating && (
                    <div className="stars">
                      ★★★★★{" "}
                      <span style={{ color: "var(--clay)" }}>
                        {d.agentRating} ({d.agentReviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="acts">
                <EnquiryPanel listing={l} agentPhone={d.agentPhone} />
              </div>
            </div>

            <div className="verifybox">
              <div className="hd">
                <Seal size={20} /> Why this listing is trusted
              </div>
              <ul>
                <li>
                  <span className="ck">✓</span> Agent NIN &amp; BVN verified
                </li>
                <li>
                  <span className="ck">✓</span> Face matched to ID
                </li>
                <li>
                  <span className="ck">✓</span> Photos passed reverse-image check
                </li>
                <li>
                  <span className="ck">✓</span> Price within {l.neighbourhood}{" "}
                  market range
                </li>
              </ul>
            </div>

            {valuationLow && valuationHigh && (
              <div className="valbox">
                <div className="lbl">✦ AI valuation estimate</div>
                <div className="rng">
                  {valuationLow} – {valuationHigh}
                </div>
                <div className="note">{valuationNote}</div>
              </div>
            )}
          </aside>
        </div>

        {/* ── Similar listings ──────────────────────────────── */}
        {similar.length > 0 && (
          <div className="wrap sim">
            <h2 className="sim__title">Similar properties</h2>
            <div className="sim__cards">
              {similar.map((s) => (
                <ListingCard key={s.id} listing={s} marketSlug={marketSlug} />
              ))}
            </div>
          </div>
        )}
      </div>
      <SiteFooter market={market} />
    </>
  );
}

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function compactPrice(l: Listing) {
  const n = Number(l.price.replace(/[^\d]/g, ""));
  if (n >= 1e9) return `₦${(n / 1e9).toFixed(0)}b`;
  if (n >= 1e6) return `₦${(n / 1e6).toFixed(0)}m${l.period}`;
  if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}k${l.period}`;
  return l.price;
}

export function generateStaticParams() {
  return [];
}
