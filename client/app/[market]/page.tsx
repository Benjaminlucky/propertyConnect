import { notFound } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Home, KeyRound, Moon, Building2,
  ShoppingBag, Package, Layers, PartyPopper,
  MapPin, BedDouble, Bath, Droplets,
  CheckCircle,
} from "lucide-react";
import { getMarket } from "@/lib/markets";
import { listingsForMarket, listingPath, dbRowToListing, DbListingRow } from "@/lib/listings";
import { supabaseServer } from "@/lib/supabase-server";
import { Seal } from "@/components/Seal";
import { SearchCard } from "@/components/SearchCard";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import "./home.css";

const CATS: {
  Icon: LucideIcon;
  title: string;
  blurb: string;
  slug: string;
}[] = [
  { Icon: Home,        title: "For Sale",       blurb: "Flats, duplexes, villas, off-plan",   slug: "for-sale"    },
  { Icon: KeyRound,    title: "For Rent",        blurb: "Apartments, self-contain, shared",     slug: "for-rent"    },
  { Icon: Moon,        title: "Short-let",       blurb: "Nightly & weekly, calendar search",    slug: "short-let"   },
  { Icon: Building2,   title: "Office Space",    blurb: "Serviced, open-plan, co-working",      slug: "office"      },
  { Icon: ShoppingBag, title: "Retail & Shops",  blurb: "Mall units, showrooms, stalls",        slug: "retail"      },
  { Icon: Package,     title: "Warehouses",      blurb: "Storage, logistics, cold storage",     slug: "warehouse"   },
  { Icon: Layers,      title: "Land",            blurb: "Plots with C of O, survey, gazette",   slug: "land"        },
  { Icon: PartyPopper, title: "Event Venues",    blurb: "Halls, rooftops, outdoor spaces",      slug: "event-venue" },
];

export const revalidate = 3600; // Revalidate trust stats + featured listings every hour

export default async function MarketHome({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: slug } = await params;
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  // Defaults — shown if DB is unavailable (e.g. during static build)
  let listings = listingsForMarket(market.id).slice(0, 3);
  let verifiedListings = 4_210;
  let checkedAgents = 980;

  try {
    const [featuredRes, listCountRes, agentCountRes] = await Promise.all([
      supabaseServer
        .from("listings")
        .select("*, agent_profiles(name, initials, slug, verified), listing_photos(url, position)")
        .eq("market_id", market.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3),
      supabaseServer
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("market_id", market.id)
        .eq("status", "active"),
      supabaseServer
        .from("agent_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verified", true),
    ]);

    if (!featuredRes.error && featuredRes.data && featuredRes.data.length > 0) {
      listings = (featuredRes.data as DbListingRow[]).map(dbRowToListing);
    }
    if (listCountRes.count !== null) verifiedListings = listCountRes.count;
    if (agentCountRes.count !== null) checkedAgents = agentCountRes.count;
  } catch { /* DB unavailable during build */ }

  return (
    <>
      <SiteHeader market={market} />

      <div className="home">
        {/* HERO */}
        <div className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">
                <CheckCircle size={14} strokeWidth={2.5} />
                Every listing verified before you call
              </span>
              <h1>
                Find a home anywhere in {market.country} you can{" "}
                <em>actually trust</em>.
              </h1>
              <p className="sub">
                Eight property categories across all 36 states and the FCT, one
                platform. Every agent ID-checked, every listing screened for scams
                — so the place you see is the place that exists.
              </p>
              <div className="trust-row">
                <div className="t">
                  <Seal size={26} />
                  <span><b>{verifiedListings.toLocaleString("en-NG")}</b> verified listings</span>
                </div>
                <div className="t">
                  <Seal size={26} />
                  <span><b>{checkedAgents.toLocaleString("en-NG")}</b> ID-checked agents</span>
                </div>
                <div className="t">
                  <span className="trust-price">₦0</span>
                  <span>to list, forever</span>
                </div>
              </div>
            </div>
            <SearchCard marketSlug={market.slug} />
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="wrap sec-gap">
          <div className="label">All 8 categories — free to list</div>
          <div className="cats">
            {CATS.map(({ Icon, title, blurb, slug: cSlug }) => (
              <Link
                key={cSlug}
                className="catc"
                href={`/${market.slug}/${cSlug}/nigeria`}
              >
                <span className="ic">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3>{title}</h3>
                <p>{blurb}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED */}
        <section className="wrap sec-gap">
          <div className="sec-head">
            <h2>Newly verified across Nigeria</h2>
            <Link className="lk" href={`/${market.slug}/for-sale/nigeria`}>
              View all →
            </Link>
          </div>
          <div className="cards">
            {listings.map((l) => (
              <Link
                key={l.id}
                className="card"
                href={`/${market.slug}/${listingPath(l)}`}
              >
                <div className="ph">
                  <span className="cat">{l.category}</span>
                  {l.verified && (
                    <span className="vbadge"><Seal size={26} /></span>
                  )}
                  <span className="imgtxt">{l.neighbourhood}, {l.lga}</span>
                </div>
                <div className="body">
                  <div className="price tabnum">
                    {l.price}
                    {l.period && <span>{l.period}</span>}
                  </div>
                  <div className="ttl">{l.title}</div>
                  <div className="loc">
                    <MapPin size={12} strokeWidth={2} style={{ flexShrink: 0, color: "var(--forest)" }} />
                    {l.neighbourhood}, {l.state}
                  </div>
                  <div className="specs">
                    <span>
                      <BedDouble size={13} strokeWidth={1.8} style={{ color: "var(--forest)" }} />
                      {l.beds}
                    </span>
                    <span>
                      <Bath size={13} strokeWidth={1.8} style={{ color: "var(--forest)" }} />
                      {l.baths}
                    </span>
                    <span>
                      <Droplets size={13} strokeWidth={1.8} style={{ color: "var(--forest)" }} />
                      {l.toilets}
                    </span>
                  </div>
                  <div className="agent">
                    <span className="av">{l.agentInitials}</span>
                    <span className="nm">
                      {l.agent}
                      {l.verified && (
                        <span className="verified-tag">
                          <CheckCircle size={11} strokeWidth={2.5} />
                          verified
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TRUST BAND */}
        <section className="wrap sec-gap">
          <div className="band">
            <div>
              <h2>Why a seal changes everything</h2>
              <p>
                Incumbents let anyone post anything. We screen first — because the
                cost of one scam isn&apos;t one bad listing, it&apos;s a buyer who
                never trusts the platform again.
              </p>
              <Link
                className="btn btn-gold"
                style={{ marginTop: 20 }}
                href={`/${market.slug}/for-sale/lagos/eti-osa/lekki/ikate/contemporary-5-bedroom-semi-detached-duplex-3531456`}
              >
                See a verified listing →
              </Link>
            </div>
            <ul>
              <li>
                <Seal size={30} />
                <div>
                  <b>Agent identity checked.</b> NIN/BVN + face match before a
                  single listing goes live.
                </div>
              </li>
              <li>
                <Seal size={30} />
                <div>
                  <b>Photos screened.</b> Reverse-image and EXIF checks flag
                  stolen or stock photos.
                </div>
              </li>
              <li>
                <Seal size={30} />
                <div>
                  <b>Prices sanity-checked.</b> Anything 40% below the area median
                  is held for review.
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <SiteFooter market={market} />
    </>
  );
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
