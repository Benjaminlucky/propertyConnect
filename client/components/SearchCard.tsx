"use client";

import { useState } from "react";
import { NG_STATES, stateSlug } from "@/lib/states";

const MIN_PRICES = [
  { value: "",          label: "No min" },
  { value: "500000",    label: "₦500k" },
  { value: "1000000",   label: "₦1m" },
  { value: "2500000",   label: "₦2.5m" },
  { value: "5000000",   label: "₦5m" },
  { value: "10000000",  label: "₦10m" },
  { value: "25000000",  label: "₦25m" },
  { value: "50000000",  label: "₦50m" },
  { value: "100000000", label: "₦100m" },
];

const MAX_PRICES = [
  { value: "",           label: "No max" },
  { value: "5000000",    label: "₦5m" },
  { value: "10000000",   label: "₦10m" },
  { value: "25000000",   label: "₦25m" },
  { value: "50000000",   label: "₦50m" },
  { value: "100000000",  label: "₦100m" },
  { value: "250000000",  label: "₦250m" },
  { value: "500000000",  label: "₦500m" },
  { value: "1000000000", label: "₦1b" },
];

export function SearchCard({ marketSlug }: { marketSlug: string }) {
  const [tab,      setTab]      = useState<"buy" | "rent" | "shortlet">("buy");
  const [keyword,  setKeyword]  = useState("");
  const [state,    setState]    = useState("");
  const [beds,     setBeds]     = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const catFor =
    tab === "buy" ? "for-sale" : tab === "rent" ? "for-rent" : "short-let";

  const filterParams = new URLSearchParams();
  if (minPrice) filterParams.set("min", minPrice);
  if (maxPrice) filterParams.set("max", maxPrice);
  if (beds)     filterParams.set("beds", beds);
  const qs = filterParams.toString();

  /* If keyword provided → go to search page; otherwise → category/state page */
  const href = keyword.trim()
    ? `/${marketSlug}/search?q=${encodeURIComponent(keyword.trim())}`
    : `/${marketSlug}/${catFor}/${state ? stateSlug(state) : "nigeria"}` +
      (qs ? "?" + qs : "");

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && keyword.trim()) {
      window.location.href = href;
    }
  }

  return (
    <div className="searchcard">
      {/* Category tabs */}
      <div className="seg">
        {(["buy", "rent", "shortlet"] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? "on" : ""}
            onClick={() => setTab(t)}
          >
            {t === "buy" ? "Buy" : t === "rent" ? "Rent" : "Short-let"}
          </button>
        ))}
      </div>

      <div className="search-body">
        {/* Keyword search — primary input */}
        <div className="field">
          <label>Search by area, type, or keyword</label>
          <input
            className="ctrl"
            type="text"
            placeholder="e.g. 3 bed flat Lekki, duplex Abuja…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {/* State + Beds */}
        <div className="two">
          <div className="field">
            <label>State</label>
            <select
              className="ctrl"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">All of Nigeria</option>
              {NG_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Min bedrooms</label>
            <select
              className="ctrl"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        {/* Price range */}
        <div className="two">
          <div className="field">
            <label>Min price</label>
            <select
              className="ctrl"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            >
              {MIN_PRICES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Max price</label>
            <select
              className="ctrl"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              {MAX_PRICES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <a className="btn btn-solid search-go" href={href}>
          {keyword.trim()
            ? `Search "${keyword.trim()}"`
            : state ? `Search ${state}` : "Search all of Nigeria"}
        </a>
      </div>
    </div>
  );
}
