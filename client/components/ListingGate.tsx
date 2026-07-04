"use client";

import { useState, useEffect } from "react";
import { AuthFlow } from "@/components/AuthFlow";
import { ListingWizard } from "@/components/ListingWizard";
import { getSessionUser, AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

interface Props {
  marketSlug: string;
  editId?: number;
}

// DB row shape from GET /api/v1/listings/:id
interface FullListingRow {
  id: number;
  category_slug: string;
  title: string;
  neighbourhood: string;
  lga: string;
  state: string;
  price: number;
  period: string;
  beds: number;
  baths: number;
  toilets: number;
  description: string;
  listing_attributes?: { key: string; value: string }[];
  listing_photos?: { url: string; position: number }[];
}

// Maps "/year" → "Per year" etc. for the wizard draft.period field
const PERIOD_REVERSE: Record<string, string> = {
  "":      "Outright",
  "/year": "Per year",
  "/night": "Per night",
  "/day":  "Per event",
};

// Attrs key → Draft field
const ATTR_TO_DRAFT: Record<string, string> = {
  "Building type":  "buildingType",
  "Furnishing":     "furnishing",
  "Title document": "titleType",
  "Condition":      "condition",
};

function rowToInitialDraft(row: FullListingRow): Record<string, unknown> {
  const draft: Record<string, unknown> = {
    category:     row.category_slug,
    state:        row.state,
    lga:          row.lga,
    neighbourhood: row.neighbourhood,
    title:        row.title,
    description:  row.description ?? "",
    price:        row.price ? Number(row.price).toLocaleString("en-NG") : "",
    period:       PERIOD_REVERSE[row.period ?? ""] ?? "Per year",
    beds:         row.beds > 0 ? String(row.beds) : "",
    baths:        row.baths > 0 ? String(row.baths) : "",
    toilets:      row.toilets > 0 ? String(row.toilets) : "",
  };

  // Size attr: "240 sqm" → sqm field
  for (const attr of row.listing_attributes ?? []) {
    const field = ATTR_TO_DRAFT[attr.key];
    if (field) {
      draft[field] = attr.value;
    } else if (attr.key === "Size") {
      draft["sqm"] = attr.value.replace(/\s*sqm$/i, "");
    }
  }

  // Existing photos: sorted by position, stored as Cloudinary URLs
  const photos = (row.listing_photos ?? [])
    .sort((a, b) => a.position - b.position)
    .map((p) => p.url);
  if (photos.length) draft["photos"] = photos;

  return draft;
}

export function ListingGate({ marketSlug, editId }: Props) {
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");
  const [initialDraft, setInitialDraft] = useState<Record<string, unknown> | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSessionUser().then((u) => {
      if (!cancelled) setUser(u);
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch listing data when in edit mode
  useEffect(() => {
    if (!editId) return;
    api.get<FullListingRow>(`/api/v1/listings/${editId}`)
      .then((row) => setInitialDraft(rowToInitialDraft(row)))
      .catch(() => setFetchError("Could not load listing. Please try again."));
  }, [editId]);

  if (user === "loading" || (editId && !initialDraft && !fetchError)) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--ground)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "var(--line)",
          animation: "shimmer 1.4s ease-in-out infinite",
        }} />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "var(--ground)" }}>
        <p style={{ color: "var(--clay)", fontSize: 15 }}>{fetchError}</p>
      </div>
    );
  }

  if (!user || !user.emailVerified) {
    return <AuthFlow marketSlug={marketSlug} onSuccess={setUser} />;
  }

  return (
    <ListingWizard
      user={user}
      marketSlug={marketSlug}
      editId={editId}
      initialDraft={initialDraft}
    />
  );
}
