import Link from "next/link";
import type { Neighbourhood } from "@/lib/neighbourhoods";
import type { Category } from "@/lib/categories";
import type { Listing } from "@/lib/listings";

interface Props {
  neighbourhood: Neighbourhood;
  category: Category;
  marketSlug: string;
  listings: Listing[];        // filtered to this neighbourhood × category
  allInArea: number;          // total listings in this neighbourhood across all categories
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}b`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(0)}m`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

const DEMAND_LABELS = {
  high:   { text: "High demand",   cls: "nh-demand--high"   },
  medium: { text: "Active market", cls: "nh-demand--medium" },
  low:    { text: "Emerging",      cls: "nh-demand--low"    },
};

export function NeighbourhoodHeader({
  neighbourhood: nh,
  category,
  marketSlug,
  listings,
  allInArea,
}: Props) {
  const prices = listings
    .map((l) => Number(l.price.replace(/[^\d]/g, "")))
    .filter((p) => p > 0);

  const count        = listings.length;
  const verifiedPct  = count > 0 ? Math.round((listings.filter((l) => l.verified).length / count) * 100) : 0;
  const avgPrice     = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minPrice     = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice     = prices.length > 0 ? Math.max(...prices) : 0;

  const demand = DEMAND_LABELS[nh.demandLevel];

  return (
    <div className="nh-wrap">

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="nh-hero">
        <div className="nh-hero__top">
          <span className={`nh-demand ${demand.cls}`}>{demand.text}</span>
          {allInArea > 0 && (
            <span className="nh-all-count">{allInArea} total listing{allInArea === 1 ? "" : "s"} in this area</span>
          )}
        </div>

        <h1 className="nh-hero__name">
          {category.label} in {nh.name}
        </h1>
        <div className="nh-hero__meta">
          {nh.lga} · {nh.state}
        </div>
        <p className="nh-hero__desc">{nh.description}</p>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="nh-stats">
        <div className="nh-stat">
          <div className="nh-stat__n">{count}</div>
          <div className="nh-stat__l">Active listings</div>
        </div>
        {avgPrice > 0 && (
          <div className="nh-stat">
            <div className="nh-stat__n">{fmtPrice(avgPrice)}</div>
            <div className="nh-stat__l">Average price</div>
          </div>
        )}
        {minPrice > 0 && maxPrice > 0 && (
          <div className="nh-stat">
            <div className="nh-stat__n">{fmtPrice(minPrice)} – {fmtPrice(maxPrice)}</div>
            <div className="nh-stat__l">Price range</div>
          </div>
        )}
        {count > 0 && (
          <div className="nh-stat">
            <div className="nh-stat__n">{verifiedPct}%</div>
            <div className="nh-stat__l">Verified listings</div>
          </div>
        )}
      </div>

      {/* ── Body: highlights + nearby ───────────────────────── */}
      <div className="nh-body">
        <div className="nh-highlights">
          <div className="nh-section-label">Area highlights</div>
          <div className="nh-highlights__grid">
            {nh.highlights.map((h) => (
              <div className="nh-highlight" key={h.label}>
                <span className="nh-highlight__icon">{h.icon}</span>
                <div>
                  <span className="nh-highlight__label">{h.label}</span>
                  <span className="nh-highlight__value">{h.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {nh.nearby.length > 0 && (
          <div className="nh-nearby">
            <div className="nh-section-label">Nearby areas</div>
            <div className="nh-nearby__chips">
              {nh.nearby.map((slug) => (
                <Link
                  key={slug}
                  className="nh-chip"
                  href={`/${marketSlug}/${category.id}/${nh.stateSlug}/${nh.lgaSlug}/${slug}`}
                >
                  {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              ))}
              <Link
                className="nh-chip nh-chip--all"
                href={`/${marketSlug}/${category.id}/${nh.stateSlug}/${nh.lgaSlug}`}
              >
                All in {nh.lga} →
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
