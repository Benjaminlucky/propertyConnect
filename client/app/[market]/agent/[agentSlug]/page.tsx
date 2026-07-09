import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getMarket } from "@/lib/markets";
import { getAgent, AGENTS, Agent, VerificationTier } from "@/lib/agents";
import { listingsByAgent, Listing, DbListingRow, dbRowToListing } from "@/lib/listings";
import { supabaseServer } from "@/lib/supabase-server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Seal } from "@/components/Seal";
import { ListingCard } from "@/components/ListingCard";
import { LeaveReviewForm } from "@/components/LeaveReviewForm";
import "../../home.css";
import "./agent.css";

export const dynamicParams = true;

type Params = { market: string; agentSlug: string };

const TIER_LABEL: Record<string, string> = {
  starter: "Starter",
  bronze:  "Bronze verified",
  silver:  "Silver verified",
  gold:    "Gold verified",
};

const TIER_COLOR: Record<string, string> = {
  starter: "var(--clay)",
  bronze:  "#cd7f32",
  silver:  "#8a8a8a",
  gold:    "var(--gold-deep)",
};

interface ReviewRow {
  id: number;
  rating: number;
  name: string;
  comment: string;
  created_at: string;
}

interface DbAgentRow {
  id: string;
  slug: string;
  name: string;
  initials: string;
  bio: string;
  specialisation: string[];
  cities: string[];
  phone: string;
  email: string;
  years_active: number;
  rating: number;
  review_count: number;
  verification_tier: string;
  verified: boolean;
  joined_year: number;
}

function dbAgentToAgent(row: DbAgentRow): Agent {
  const initials =
    row.initials ||
    row.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  return {
    slug:             row.slug,
    name:             row.name,
    initials,
    bio:              row.bio ?? "",
    specialisation:   row.specialisation ?? [],
    cities:           row.cities ?? [],
    phone:            row.phone ?? "",
    email:            row.email ?? "",
    yearsActive:      row.years_active ?? 0,
    rating:           Number(row.rating ?? 0),
    reviewCount:      row.review_count ?? 0,
    verificationTier: (row.verification_tier ?? "starter") as VerificationTier,
    verified:         row.verified ?? false,
    joinedYear:       row.joined_year ?? new Date().getFullYear(),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { market: marketSlug, agentSlug } = await params;
  const url = `https://mypropertyconnect.ng/${marketSlug}/agent/${agentSlug}`;
  const seed = getAgent(agentSlug);
  if (seed) {
    const title = `${seed.name} — Verified Property Agent | MyPropertyConnect`;
    return {
      title,
      description: seed.bio,
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        title,
        description: seed.bio,
        url,
        images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: title }],
      },
      twitter: { card: "summary_large_image", title, description: seed.bio, images: ["/og-default.jpg"] },
    };
  }
  const { data } = await supabaseServer
    .from("agent_profiles")
    .select("name, bio")
    .eq("slug", agentSlug)
    .single();
  if (!data) return {};
  const title = `${data.name} — Property Agent | MyPropertyConnect`;
  const description = (data.bio as string) || undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og-default.jpg"] },
  };
}

export async function generateStaticParams() {
  return AGENTS.map((a) => ({ agentSlug: a.slug }));
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { market: marketSlug, agentSlug } = await params;
  const market = getMarket(marketSlug);
  if (!market || !market.live) notFound();

  let agent: Agent;
  let listings: Listing[];
  let agentId: string | null = null;
  let reviews: ReviewRow[] = [];

  const seedAgent = getAgent(agentSlug);
  if (seedAgent) {
    agent = seedAgent;
    listings = listingsByAgent(agentSlug).filter((l) => l.marketId === market.id);
  } else {
    const { data: profileRow, error } = await supabaseServer
      .from("agent_profiles")
      .select("*")
      .eq("slug", agentSlug)
      .single();

    if (error || !profileRow) notFound();

    agentId = profileRow.id as string;
    agent = dbAgentToAgent(profileRow as DbAgentRow);

    const [listingsRes, reviewsRes] = await Promise.all([
      supabaseServer
        .from("listings")
        .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
        .eq("agent_id", profileRow.id)
        .eq("status", "active")
        .eq("market_id", market.id)
        .order("created_at", { ascending: false }),
      supabaseServer
        .from("reviews")
        .select("id, rating, name, comment, created_at")
        .eq("agent_id", profileRow.id)
        .eq("approved", true)
        .order("created_at", { ascending: false }),
    ]);

    listings = (listingsRes.data ?? []).map((r) => dbRowToListing(r as DbListingRow));
    reviews  = (reviewsRes.data ?? []) as ReviewRow[];
  }

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    url: `https://mypropertyconnect.ng/${market.slug}/agent/${agent.slug}`,
  };
  if (agent.bio) ld.description = agent.bio;
  if (agent.cities.length) ld.areaServed = agent.cities.join(", ");
  if (agent.rating > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: agent.rating,
      reviewCount: agent.reviewCount,
    };
  }

  return (
    <>
      <SiteHeader market={market} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <div className="home">
        <div className="wrap">
          <div className="crumbs">
            <Link href={`/${market.slug}`}>Home</Link>
            <span className="sep">›</span>
            <span>Agent profile</span>
          </div>
        </div>

        <div className="wrap ag-layout">
          {/* ── Left: agent card ── */}
          <aside className="ag-card">
            <div className="ag-avatar">{agent.initials}</div>

            <h1 className="ag-name">
              {agent.name}
              {agent.verified && <Seal size={20} />}
            </h1>

            <div
              className="ag-tier"
              style={{ color: TIER_COLOR[agent.verificationTier] ?? TIER_COLOR.starter }}
            >
              ● {TIER_LABEL[agent.verificationTier] ?? "Starter"}
            </div>

            {agent.rating > 0 && (
              <div className="ag-rating">
                ★★★★★{" "}
                <span>
                  {agent.rating} ({agent.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="ag-meta">
              <div>
                <span>Active since</span>
                <strong>{agent.joinedYear}</strong>
              </div>
              <div>
                <span>Years active</span>
                <strong>{agent.yearsActive || "—"}</strong>
              </div>
              {agent.cities.length > 0 && (
                <div>
                  <span>Cities</span>
                  <strong>{agent.cities.join(", ")}</strong>
                </div>
              )}
            </div>

            {agent.specialisation.length > 0 && (
              <div className="ag-specs">
                {agent.specialisation.map((s) => (
                  <span key={s} className="ag-spec-chip">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {agent.bio && <div className="ag-bio">{agent.bio}</div>}

            {agent.phone && (
              <a
                className="ag-contact-btn"
                href={`https://wa.me/234${agent.phone.replace(/^0/, "")}?text=${encodeURIComponent(
                  `Hi ${agent.name.split(" ")[0]}, I found your profile on MyPropertyConnect.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {agent.name.split(" ")[0]}
              </a>
            )}

            {agent.email && (
              <a className="ag-contact-btn ag-contact-btn--sec" href={`mailto:${agent.email}`}>
                Email agent
              </a>
            )}
          </aside>

          {/* ── Right: listings + reviews ── */}
          <div className="ag-listings">
            <h2 className="ag-listings-hd">
              {listings.length} active listing{listings.length === 1 ? "" : "s"}
            </h2>

            {listings.length > 0 ? (
              <div className="res-cards">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} marketSlug={market.slug} />
                ))}
              </div>
            ) : (
              <p className="ag-empty">
                No active listings from this agent right now.{" "}
                <Link href={`/${market.slug}/list`}>List a property free</Link>.
              </p>
            )}

            {/* ── Reviews section (DB agents only) ── */}
            {agentId && (
              <section className="ag-reviews" id="reviews">
                <h2 className="ag-listings-hd" style={{ marginTop: 48, marginBottom: 20 }}>
                  Reviews
                  {reviews.length > 0 && (
                    <span className="ag-reviews-ct"> ({reviews.length})</span>
                  )}
                </h2>

                {reviews.length > 0 ? (
                  <div className="rv-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="rv-card">
                        <div className="rv-card__head">
                          <span className="rv-card__stars">
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                          </span>
                          <span className="rv-card__name">{r.name}</span>
                          <span className="rv-card__date">
                            {new Date(r.created_at).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="rv-card__comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="ag-empty" style={{ marginBottom: 24 }}>
                    No reviews yet — be the first.
                  </p>
                )}

                <div className="rv-form-wrap">
                  <h3 className="rv-form-wrap__title">Leave a review</h3>
                  <LeaveReviewForm
                    agentId={agentId}
                    agentSlug={agentSlug}
                    agentName={agent.name}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <SiteFooter market={market} />
    </>
  );
}
