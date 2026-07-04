"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ListingFilter } from "@/lib/listings";

const SORT_DEFAULT = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
];

const SORT_RELEVANCE = [
  { value: "newest",     label: "Best match" },
  { value: "price_asc",  label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
];

const BEDS = [
  { value: "",  label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

const MIN_PRICES = [
  { value: "",           label: "No min" },
  { value: "500000",     label: "₦500k" },
  { value: "1000000",    label: "₦1m" },
  { value: "2500000",    label: "₦2.5m" },
  { value: "5000000",    label: "₦5m" },
  { value: "10000000",   label: "₦10m" },
  { value: "25000000",   label: "₦25m" },
  { value: "50000000",   label: "₦50m" },
  { value: "100000000",  label: "₦100m" },
  { value: "250000000",  label: "₦250m" },
];

const MAX_PRICES = [
  { value: "",            label: "No max" },
  { value: "2000000",     label: "₦2m" },
  { value: "5000000",     label: "₦5m" },
  { value: "10000000",    label: "₦10m" },
  { value: "25000000",    label: "₦25m" },
  { value: "50000000",    label: "₦50m" },
  { value: "100000000",   label: "₦100m" },
  { value: "250000000",   label: "₦250m" },
  { value: "500000000",   label: "₦500m" },
  { value: "1000000000",  label: "₦1b" },
];

interface Props {
  filter: ListingFilter;
  showBeds: boolean;
  total: number;
  filtered: number;
  baseParams?: Record<string, string>;
  sortByRelevance?: boolean;
}

export function FilterBar({ filter, showBeds, total, filtered, baseParams, sortByRelevance }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function update(changes: Record<string, string>) {
    const p = new URLSearchParams(baseParams);
    if (filter.sort && filter.sort !== "newest") p.set("sort", filter.sort);
    if (filter.beds)     p.set("beds",     String(filter.beds));
    if (filter.minPrice) p.set("min",      String(filter.minPrice));
    if (filter.maxPrice) p.set("max",      String(filter.maxPrice));
    if (filter.verified) p.set("verified", "1");

    for (const [k, v] of Object.entries(changes)) {
      if (v) p.set(k, v);
      else   p.delete(k);
    }
    const qs = p.toString();
    router.push(pathname + (qs ? "?" + qs : ""));
  }

  const active = !!(
    filter.verified ||
    filter.beds ||
    filter.minPrice ||
    filter.maxPrice ||
    (filter.sort && filter.sort !== "newest")
  );

  const bedVal = String(filter.beds ?? "");
  const sortVal = filter.sort ?? "newest";
  const minVal  = String(filter.minPrice  ?? "");
  const maxVal  = String(filter.maxPrice  ?? "");

  return (
    <div className="fb" role="search" aria-label="Filter listings">
      {/* Verified toggle */}
      <button
        className={`chip${filter.verified ? " act" : ""}`}
        aria-pressed={!!filter.verified}
        onClick={() => update({ verified: filter.verified ? "" : "1" })}
      >
        Verified ✓
      </button>

      <div className="fb__sep" aria-hidden="true" />

      {/* Sort */}
      <div className="fb__sel-wrap">
        <select
          aria-label="Sort order"
          className={sortVal !== "newest" ? "on" : ""}
          value={sortVal}
          onChange={(e) =>
            update({ sort: e.target.value === "newest" ? "" : e.target.value })
          }
        >
          {(sortByRelevance ? SORT_RELEVANCE : SORT_DEFAULT).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Beds — only for residential categories */}
      {showBeds && (
        <>
          <div className="fb__sep" aria-hidden="true" />
          <div className="fb__beds" role="group" aria-label="Minimum bedrooms">
            <span className="fb__beds-lbl" aria-hidden="true">Beds</span>
            {BEDS.map((b) => (
              <button
                key={b.value}
                className={`fb__bed${bedVal === b.value ? " on" : ""}`}
                aria-pressed={bedVal === b.value}
                onClick={() =>
                  update({ beds: bedVal === b.value && b.value ? "" : b.value })
                }
              >
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="fb__sep" aria-hidden="true" />

      {/* Price range */}
      <div className="fb__price" role="group" aria-label="Price range">
        <div className="fb__sel-wrap">
          <select
            aria-label="Minimum price"
            className={minVal ? "on" : ""}
            value={minVal}
            onChange={(e) => update({ min: e.target.value })}
          >
            {MIN_PRICES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <span className="fb__dash" aria-hidden="true">–</span>
        <div className="fb__sel-wrap">
          <select
            aria-label="Maximum price"
            className={maxVal ? "on" : ""}
            value={maxVal}
            onChange={(e) => update({ max: e.target.value })}
          >
            {MAX_PRICES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear */}
      {active && (
        <>
          <div className="fb__sep" aria-hidden="true" />
          <button
            className="fb__clear"
            onClick={() => {
              const qs = baseParams ? new URLSearchParams(baseParams).toString() : "";
              router.push(pathname + (qs ? "?" + qs : ""));
            }}
          >
            × Clear
          </button>
        </>
      )}

      {/* Live count badge */}
      {active && filtered !== total && (
        <span className="fb__count" aria-live="polite">
          {filtered} of {total}
        </span>
      )}
    </div>
  );
}
