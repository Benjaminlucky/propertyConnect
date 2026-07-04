"use client";

import { useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ViewTracker({ listingId }: { listingId: number }) {
  useEffect(() => {
    // Seed listings have IDs >= 1,000,000 — only track real DB listings
    if (listingId >= 1_000_000) return;
    fetch(`${API}/api/v1/listings/${listingId}/view`, { method: "POST" }).catch(() => {});
  }, [listingId]);
  return null;
}
