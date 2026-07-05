"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Building2, MessageSquare, BarChart2,
  Star, Settings, Check, AlertCircle, ShieldCheck, Plus,
  Flame, Thermometer, Snowflake,
} from "lucide-react";
import { toast } from "sonner";
import { getLeads, updateLeadStatus, fetchDbLeads, updateDbLeadStatus } from "@/lib/enquiries";
import type { Lead } from "@/lib/enquiries";
import { getStoredUser, signOutWithSupabase, PERSONA_META, storeUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { AuthFlow } from "@/components/AuthFlow";
import { revalidateAfterPublish } from "@/lib/actions";

/* ── Types ──────────────────────────────────────────────────── */
type Tab = "overview" | "listings" | "leads" | "analytics" | "reviews" | "settings";
type ListingStatus = "live" | "review" | "draft";
type LeadStatus = "new" | "viewing" | "responded";

interface MockListing {
  id: string;
  title: string;
  location: string;
  price: string;
  status: ListingStatus;
  views: number;
  leads: number;
  photo?: string;
  category: string;
  state: string;
}

interface DbListing {
  id: number;
  title: string;
  neighbourhood: string;
  lga: string;
  state: string;
  price: number;
  period: string;
  category_slug: string;
  status: string;
  created_at: string;
  listing_photos?: { url: string; position: number }[];
}

function formatDbPrice(price: number, period: string): string {
  let label: string;
  if (price >= 1_000_000_000)  label = `₦${(price / 1_000_000_000).toFixed(1)}b`;
  else if (price >= 1_000_000) label = `₦${(price / 1_000_000).toFixed(0)}m`;
  else if (price >= 1_000)     label = `₦${(price / 1_000).toFixed(0)}k`;
  else                         label = `₦${price}`;
  return period ? `${label}${period}` : label;
}

function dbToMock(l: DbListing, leadCount = 0): MockListing {
  const sorted = [...(l.listing_photos ?? [])].sort((a, b) => a.position - b.position);
  return {
    id:       l.id.toString(),
    title:    l.title,
    location: [l.neighbourhood, l.lga, l.state].filter(Boolean).join(" · "),
    price:    formatDbPrice(l.price, l.period),
    status:   l.status === "active" ? "live" : l.status === "pending" ? "review" : "draft",
    views:    0,
    leads:    leadCount,
    photo:    sorted[0]?.url,
    category: l.category_slug,
    state:    l.state,
  };
}

/* ── Verification step config ───────────────────────────────── */
const STEP_CONFIG = [
  { id: "nin",   label: "NIN Verified"        },
  { id: "bvn",   label: "BVN Linked"          },
  { id: "face",  label: "Face ID Check"       },
  { id: "cac",   label: "CAC Certificate"     },
  { id: "rean",  label: "REAN Licence"        },
  { id: "photo", label: "Professional Photo"  },
];

const DAYS_7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DashboardReview {
  id: number;
  rating: number;
  name: string;
  comment: string;
  approved: boolean;
  created_at: string;
}

interface AnalyticsData {
  daily:     { date: string; views: number }[];
  byListing: { id: number; title: string; views: number; leads: number }[];
  totals:    { views: number; leads: number };
}


/* ── Helpers ────────────────────────────────────────────────── */
function scoreClass(n: number) {
  if (n >= 80) return "db-score--hot";
  if (n >= 65) return "db-score--warm";
  return "db-score--cool";
}
function scoreLabel(n: number) {
  if (n >= 80) return "Hot";
  if (n >= 65) return "Warm";
  return "Cool";
}
function ScoreIcon({ score }: { score: number }) {
  if (score >= 80) return <Flame size={12} strokeWidth={2} />;
  if (score >= 65) return <Thermometer size={12} strokeWidth={2} />;
  return <Snowflake size={12} strokeWidth={2} />;
}

/* ── Component ──────────────────────────────────────────────── */
export function DashboardView({ marketSlug }: { marketSlug: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [listFilter, setListFilter] = useState<ListingStatus | "all">("all");
  const [leadFilter, setLeadFilter] = useState<LeadStatus | "all">("all");
  const [period, setPeriod] = useState<"7d" | "30d">("30d");
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null | "loading">("loading");
  const [dbListings, setDbListings] = useState<MockListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [verifyItems, setVerifyItems] = useState<{ label: string; sub: string; done: boolean }[]>([]);
  const [verifyDoneCount, setVerifyDoneCount] = useState(0);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formSpecialisation, setFormSpecialisation] = useState("");
  const [formCities, setFormCities] = useState("");
  const [reviewItems, setReviewItems] = useState<DashboardReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [agentProfileSlug, setAgentProfileSlug] = useState("");
  const [agentRating, setAgentRating] = useState(0);
  const [agentReviewCount, setAgentReviewCount] = useState(0);

  // Check session on mount
  useEffect(() => {
    const check = async () => {
      const { supabase } = await import("@/lib/supabase-client");
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const stored = getStoredUser();
        if (stored) {
          setAuthUser(stored);
        } else {
          const meta = data.session.user.user_metadata as Record<string, string>;
          setAuthUser({
            id:               data.session.user.id,
            name:             meta.name ?? data.session.user.email?.split("@")[0] ?? "User",
            email:            data.session.user.email ?? "",
            phone:            meta.phone ?? "",
            persona:          (meta.persona as AuthUser["persona"]) ?? "agent",
            emailVerified:    !!data.session.user.email_confirmed_at,
            identityVerified: false,
            verificationTier: "starter",
            joinedAt:         data.session.user.created_at,
          });
        }
      } else {
        setAuthUser(null);
      }
    };
    check();
  }, []);

  // Fetch listings (with photos), lead counts, and verification status in parallel
  useEffect(() => {
    if (!authUser || authUser === "loading") return;
    const fetchAll = async () => {
      setListingsLoading(true);
      const { supabase } = await import("@/lib/supabase-client");

      const { data, error } = await supabase
        .from("listings")
        .select("id, title, neighbourhood, lga, state, price, period, category_slug, status, created_at, listing_photos(url, position)")
        .eq("agent_id", authUser.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const rows = data as DbListing[];
        const ids  = rows.map((r) => r.id);

        // Lead counts + verification status in parallel
        const [enqRes, subRes] = await Promise.all([
          ids.length > 0
            ? supabase.from("enquiries").select("listing_id").in("listing_id", ids)
            : Promise.resolve({ data: [] as { listing_id: number }[] }),
          supabase
            .from("verification_submissions")
            .select("step_id, status")
            .eq("agent_id", authUser.id),
        ]);

        // Build lead count map
        const leadMap: Record<number, number> = {};
        for (const e of enqRes.data ?? []) {
          leadMap[e.listing_id] = (leadMap[e.listing_id] ?? 0) + 1;
        }
        setDbListings(rows.map((r) => dbToMock(r, leadMap[r.id] ?? 0)));

        // Build verification items from real DB submissions
        const subMap = new Map(
          (subRes.data ?? []).map((s) => [s.step_id as string, s.status as string]),
        );
        const items = STEP_CONFIG.map((s) => {
          const st = subMap.get(s.id);
          return {
            label: s.label,
            sub:   st === "approved" ? "Verified" : st === "review" ? "Under review" : "Pending",
            done:  st === "approved",
          };
        });
        setVerifyItems(items);
        setVerifyDoneCount(items.filter((i) => i.done).length);
      }
      setListingsLoading(false);
    };
    fetchAll();
  }, [authUser]);

  // Fetch analytics when analytics tab is opened (lazy, once per period change)
  useEffect(() => {
    if (tab !== "analytics" || !authUser || authUser === "loading") return;
    const load = async () => {
      setAnalyticsLoading(true);
      const { getAccessToken } = await import("@/lib/supabase-client");
      const token = await getAccessToken();
      if (!token) { setAnalyticsLoading(false); return; }
      const { api } = await import("@/lib/api");
      const data = await api.get<AnalyticsData>(
        `/api/v1/analytics?period=${period}`, token
      ).catch(() => null);
      if (data) setAnalyticsData(data);
      setAnalyticsLoading(false);
    };
    load();
  }, [tab, period, authUser]);

  // Fetch leads from API + localStorage whenever leads tab is opened or user changes
  useEffect(() => {
    if (!authUser || authUser === "loading") return;
    const load = async () => {
      setLeadsLoading(true);
      const { getAccessToken } = await import("@/lib/supabase-client");
      const token = await getAccessToken();
      const [dbLeads, localLeads] = await Promise.all([
        token ? fetchDbLeads(token) : Promise.resolve([]),
        Promise.resolve(getLeads()),
      ]);
      // Merge: DB leads first, then local leads for seed listings (id >= 1,000,000)
      const dbIds = new Set(dbLeads.map((l) => l.id));
      const seedLocal = localLeads.filter((l) => l.listingId >= 1_000_000);
      const merged = [...dbLeads, ...seedLocal.filter((l) => !dbIds.has(l.id))];
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllLeads(merged);
      setLeadsLoading(false);
    };
    load();
  }, [authUser, tab]);

  // Fetch reviews when reviews tab opens (lazy, once per session)
  useEffect(() => {
    if (tab !== "reviews" || !authUser || authUser === "loading" || reviewsLoaded) return;
    const load = async () => {
      setReviewsLoading(true);
      const { supabase } = await import("@/lib/supabase-client");
      const [reviewsRes, profileRes] = await Promise.all([
        supabase
          .from("reviews")
          .select("id, rating, name, comment, approved, created_at")
          .eq("agent_id", authUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_profiles")
          .select("slug, rating, review_count")
          .eq("id", authUser.id)
          .single(),
      ]);
      if (reviewsRes.data) setReviewItems(reviewsRes.data as DashboardReview[]);
      if (profileRes.data) {
        setAgentProfileSlug((profileRes.data.slug as string) ?? "");
        setAgentRating(Number(profileRes.data.rating) || 0);
        setAgentReviewCount(Number(profileRes.data.review_count) || 0);
      }
      setReviewsLoaded(true);
      setReviewsLoading(false);
    };
    load();
  }, [tab, authUser, reviewsLoaded]);

  // Fetch agent_profiles when settings tab opens (lazy, once per session)
  useEffect(() => {
    if (tab !== "settings" || !authUser || authUser === "loading" || settingsLoaded) return;
    const load = async () => {
      setSettingsLoading(true);
      const { supabase } = await import("@/lib/supabase-client");
      const { data } = await supabase
        .from("agent_profiles")
        .select("name, phone, bio, specialisation, cities")
        .eq("id", authUser.id)
        .single();
      if (data) {
        setFormName(data.name || authUser.name);
        setFormPhone(data.phone || authUser.phone);
        setFormBio(data.bio || "");
        setFormSpecialisation(((data.specialisation as string[]) ?? []).join(", "));
        setFormCities(((data.cities as string[]) ?? []).join(", "));
        setSettingsLoaded(true);
      } else {
        // No profile row yet — seed from authUser
        setFormName(authUser.name);
        setFormPhone(authUser.phone);
        setSettingsLoaded(true);
      }
      setSettingsLoading(false);
    };
    load();
  }, [tab, authUser, settingsLoaded]);

  const handleSignOut = async () => {
    await signOutWithSupabase();
    setAuthUser(null);
  };

  const handleSaveSettings = async () => {
    if (!authUser || authUser === "loading") return;
    setSettingsSaving(true);
    const nameTrimmed = formName.trim();
    const parts = nameTrimmed.split(/\s+/);
    const newInitials =
      parts.length >= 2
        ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
        : nameTrimmed.slice(0, 2).toUpperCase();
    const { supabase } = await import("@/lib/supabase-client");
    const { error } = await supabase
      .from("agent_profiles")
      .update({
        name:           nameTrimmed,
        phone:          formPhone.trim(),
        bio:            formBio.trim(),
        specialisation: formSpecialisation.split(",").map((s) => s.trim()).filter(Boolean),
        cities:         formCities.split(",").map((s) => s.trim()).filter(Boolean),
        initials:       newInitials,
      })
      .eq("id", authUser.id);
    if (error) {
      toast.error("Failed to save profile. Please try again.");
      setSettingsSaving(false);
      return;
    }
    // Keep Supabase user_metadata in sync so name/phone are correct after re-login
    await supabase.auth.updateUser({
      data: { name: nameTrimmed, phone: formPhone.trim() },
    });
    const updated: AuthUser = { ...authUser, name: nameTrimmed, phone: formPhone.trim() };
    setAuthUser(updated);
    storeUser(updated);
    toast.success("Profile saved");
    setSettingsSaving(false);
  };

  // ── Auth gate ──
  if (authUser === "loading") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--clay)", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }
  if (authUser === null) {
    return <AuthFlow onSuccess={(u) => setAuthUser(u)} marketSlug={marketSlug} />;
  }

  // ── Derived from real user ──
  const nameParts  = authUser.name.trim().split(/\s+/);
  const initials   = nameParts.length >= 2
    ? nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
    : authUser.name.slice(0, 2).toUpperCase();
  const firstName  = nameParts[0];
  const personaLabel = PERSONA_META[authUser.persona]?.label ?? "Agent";

  const filteredListings =
    listFilter === "all"
      ? dbListings
      : dbListings.filter((l) => l.status === listFilter);

  const filteredLeads = leadFilter === "all"
    ? allLeads
    : allLeads.filter((l) => {
        if (leadFilter === "new")      return l.status === "new";
        if (leadFilter === "viewing")  return l.status === "viewed";
        return l.status === "replied" || l.status === "closed";
      });

  const newLeadCount = allLeads.filter((l) => l.status === "new").length;

  const NAV_ITEMS: { id: Tab; Icon: LucideIcon; label: string; dot?: boolean }[] = [
    { id: "overview",  Icon: LayoutDashboard, label: "Overview" },
    { id: "listings",  Icon: Building2,       label: "Listings" },
    { id: "leads",     Icon: MessageSquare,   label: "Leads", dot: newLeadCount > 0 },
    { id: "analytics", Icon: BarChart2,       label: "Analytics" },
    { id: "reviews",   Icon: Star,            label: "Reviews" },
    { id: "settings",  Icon: Settings,        label: "Settings" },
  ];

  return (
    <div className="db-shell">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="db-side">
        <div className="db-agent">
          <div className="db-agent__av">{initials}</div>
          <div className="db-agent__name">{authUser.name}</div>
          <div className="db-agent__role">{personaLabel}</div>
          <div className="db-agent__badges">
            {authUser.emailVerified && (
              <span className="db-badge db-badge--verified">✓ Verified</span>
            )}
            <span className="db-badge" style={{ background: "rgba(11,61,46,.08)", color: "var(--forest)" }}>
              {authUser.verificationTier.charAt(0).toUpperCase() + authUser.verificationTier.slice(1)}
            </span>
          </div>
          <div className="db-agent__stat">
            <strong>{dbListings.length}</strong> listing{dbListings.length !== 1 ? "s" : ""} on platform
          </div>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: 10, background: "none", border: "1px solid var(--line)",
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "var(--clay)",
              cursor: "pointer", width: "100%", fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>

        <nav className="db-nav" role="navigation" aria-label="Dashboard navigation">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              className={`db-nav__item${tab === n.id ? " active" : ""}`}
              onClick={() => setTab(n.id)}
              aria-current={tab === n.id ? "page" : undefined}
            >
              <n.Icon size={16} strokeWidth={1.8} />
              {n.label}
              {n.dot && tab !== n.id && <span className="db-nav__dot" />}
            </button>
          ))}
        </nav>

        <Link className="db-new-btn" href={`/${marketSlug}/list`}>
          <Plus size={15} strokeWidth={2.5} /> New listing
        </Link>
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="db-main">

        {/* ════════ OVERVIEW ════════ */}
        {tab === "overview" && (
          <>
            <h2 className="db-section-title">Welcome back, {firstName}</h2>

            {/* Stats */}
            <div className="db-stats">
              <div className="db-stat">
                <div className="db-stat__n">{dbListings.filter(l => l.status === "live").length}</div>
                <div className="db-stat__label">Active listings</div>
                <div className="db-stat__delta">{listingsLoading ? "Loading…" : `${dbListings.length} total`}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat__n">{analyticsData ? analyticsData.totals.views.toLocaleString() : "—"}</div>
                <div className="db-stat__label">Views (30d)</div>
                <div className="db-stat__delta">{analyticsData ? `${analyticsData.totals.leads} enquiries` : "Open Analytics tab to load"}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat__n">{leadsLoading ? "…" : allLeads.length || "—"}</div>
                <div className="db-stat__label">Leads (30d)</div>
                <div className="db-stat__delta">{allLeads.length > 0 ? `${newLeadCount} new` : "No leads yet"}</div>
              </div>
              <div className="db-stat">
                <div className="db-stat__n">—</div>
                <div className="db-stat__label">Rating</div>
                <div className="db-stat__delta">No reviews yet</div>
              </div>
            </div>

            {/* Top listing */}
            <div className="db-panel">
              <div className="db-panel__head">
                <h3>Your listings</h3>
                <button className="db-act" onClick={() => setTab("listings")}>
                  View all →
                </button>
              </div>
              {listingsLoading ? (
                <div style={{ padding: "18px", color: "var(--clay)", fontSize: 13 }}>Loading…</div>
              ) : dbListings.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center" }}>
                  <p style={{ color: "var(--clay)", fontSize: 14, marginBottom: 12 }}>
                    You haven&apos;t published any listings yet.
                  </p>
                  <Link className="db-act" href={`/${marketSlug}/list`} style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700 }}>
                    + Create your first listing
                  </Link>
                </div>
              ) : (
                <div style={{ padding: "14px 18px" }}>
                  <div className="db-top">
                    <div className="db-top__thumb" style={{ overflow: "hidden", flexShrink: 0 }}>
                      {dbListings[0]?.photo ? (
                        <img
                          src={dbListings[0].photo.replace("/upload/", "/upload/w_80,h_80,c_fill/")}
                          alt={dbListings[0].title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--line)" }} />
                      )}
                    </div>
                    <div>
                      <div className="db-top__label">Most recent listing</div>
                      <div className="db-top__title">{dbListings[0].title} — {dbListings[0].price}</div>
                      <div className="db-top__stats">
                        <span>{dbListings[0].location}</span>
                        <span style={{ textTransform: "capitalize" }}>{dbListings[0].status}</span>
                        <span>{dbListings.length} total listing{dbListings.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent leads preview */}
            <div className="db-panel">
              <div className="db-panel__head">
                <h3>Recent leads</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="db-panel__meta">Scored by AI on intent &amp; budget fit</span>
                  <button className="db-act" onClick={() => setTab("leads")}>
                    All leads →
                  </button>
                </div>
              </div>
              {allLeads.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "var(--clay)", fontSize: 14 }}>
                  No leads yet. Share your listing link to start getting enquiries.
                </div>
              ) : (
                allLeads.slice(0, 3).map((lead) => {
                  const initials = lead.senderName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                  const diff = Date.now() - new Date(lead.createdAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  const timeAgo = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins/60)}h ago` : `${Math.floor(mins/1440)}d ago`;
                  return (
                    <div className="db-lead" key={lead.id}>
                      <div className="db-lead__av">{initials}</div>
                      <div className="db-lead__body">
                        <div className="db-lead__top">
                          <span className="db-lead__name">{lead.senderName}</span>
                          <span className="db-lead__time">{timeAgo}</span>
                          <span className="db-lead__listing">{lead.listingTitle.split(",")[0]}</span>
                        </div>
                        {lead.message && <p className="db-lead__msg">{lead.message}</p>}
                        {lead.viewingDate && <p className="db-lead__msg">Viewing: {lead.viewingDate} at {lead.viewingTime}</p>}
                        <div className="db-lead__actions">
                          <button className="db-act" onClick={() => setTab("leads")}>View all leads</button>
                        </div>
                      </div>
                      <div className="db-lead__score">
                        <span className={`db-score ${scoreClass(lead.score)}`}>
                          <ScoreIcon score={lead.score} /> {scoreLabel(lead.score)} · {lead.score}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Verification checklist */}
            <div className="db-panel">
              <div className="db-panel__head">
                <h3>Trust &amp; verification</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="db-panel__meta">
                    {verifyDoneCount} of 6 complete ·{" "}
                    {verifyDoneCount >= 6 ? "Gold" : verifyDoneCount >= 4 ? "Silver" : verifyDoneCount >= 3 ? "Bronze" : "Starter"} tier
                  </span>
                  <Link className="db-act" href={`/${marketSlug}/verify`}>
                    {verifyDoneCount < 6 ? "Complete verification →" : "View verification →"}
                  </Link>
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                {verifyItems.length === 0 ? (
                  <div style={{ color: "var(--clay)", fontSize: 13, paddingBottom: 8 }}>
                    No verification steps started yet.
                  </div>
                ) : (
                  <div className="db-verify">
                    {verifyItems.map((v) => (
                      <div
                        key={v.label}
                        className={`db-verify__item${v.done ? " db-verify__item--done" : " db-verify__item--pending"}`}
                      >
                        <div className={`db-verify__ck db-verify__ck--${v.done ? "done" : "pending"}`}>
                          {v.done
                            ? <Check size={13} strokeWidth={2.5} />
                            : <AlertCircle size={13} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <div className="db-verify__text">{v.label}</div>
                          <div className="db-verify__sub">{v.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {verifyDoneCount < 6 && (
                  <div style={{ marginTop: 14, textAlign: "center" }}>
                    <Link
                      href={`/${marketSlug}/verify`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        background: "var(--forest)",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 22px",
                        fontSize: 13.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <ShieldCheck size={15} strokeWidth={2} />
                      {verifyDoneCount === 0
                        ? "Start verification → Earn your trust badge"
                        : `${6 - verifyDoneCount} step${6 - verifyDoneCount === 1 ? "" : "s"} left → Earn Gold seal`}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════ MY LISTINGS ════════ */}
        {tab === "listings" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="db-section-title" style={{ marginBottom: 0 }}>Listings</h2>
              <Link className="db-new-btn" href={`/${marketSlug}/list`} style={{ width: "auto", padding: "10px 18px" }}>
                ＋ New listing
              </Link>
            </div>

            <div className="db-ftabs">
              {(["all", "live", "review", "draft"] as const).map((f) => {
                const count = f === "all" ? dbListings.length : dbListings.filter((l) => l.status === f).length;
                return (
                  <button
                    key={f}
                    className={`db-ftab${listFilter === f ? " active" : ""}`}
                    onClick={() => setListFilter(f)}
                  >
                    {f === "all" ? "All" : f === "live" ? "Live" : f === "review" ? "In Review" : "Draft"}
                    <span className="db-ftab__ct">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="db-panel">
              {listingsLoading ? (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clay)" }}>
                  Loading your listings…
                </div>
              ) : filteredListings.length === 0 ? (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clay)" }}>
                  {dbListings.length === 0
                    ? <>No listings yet. <Link href={`/${marketSlug}/list`} style={{ color: "var(--forest)", fontWeight: 600 }}>Create your first listing →</Link></>
                    : "No listings in this category."}
                </div>
              ) : (
                filteredListings.map((l) => (
                  <div className="db-lrow" key={l.id}>
                    <div className="db-lrow__thumb" style={{ overflow: "hidden" }}>
                      {l.photo ? (
                        <img
                          src={l.photo.replace("/upload/", "/upload/w_120,h_90,c_fill/")}
                          alt={l.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={18} strokeWidth={1.5} style={{ color: "var(--clay)" }} />
                        </div>
                      )}
                    </div>
                    <div className="db-lrow__info">
                      <div className="db-lrow__title">{l.title}</div>
                      <div className="db-lrow__meta">{l.price} · {l.location}</div>
                    </div>
                    <span className={`db-pill db-pill--${l.status}`}>
                      {l.status === "live" ? "Live" : l.status === "review" ? "In Review" : "Draft"}
                    </span>
                    <div className="db-lrow__stats">
                      <div style={{ textAlign: "center" }}>
                        <b>{l.views.toLocaleString()}</b>
                        <div>views</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <b>{l.leads}</b>
                        <div>leads</div>
                      </div>
                    </div>
                    <div className="db-lrow__actions">
                      <Link className="db-act" href={`/${marketSlug}/list?edit=${l.id}`}>Edit</Link>
                      <button
                        className="db-act"
                        onClick={async () => {
                          const goLive   = l.status !== "live";
                          const dbStatus = goLive ? "active" : "draft";
                          const { supabase } = await import("@/lib/supabase-client");
                          const { error } = await supabase
                            .from("listings")
                            .update({ status: dbStatus })
                            .eq("id", Number(l.id));
                          if (error) { toast.error("Could not update listing status."); return; }
                          setDbListings((prev) =>
                            prev.map((x) => x.id === l.id ? { ...x, status: goLive ? "live" : "draft" } : x),
                          );
                          toast.success(goLive ? "Listing is now live" : "Listing moved to draft");
                          void revalidateAfterPublish(marketSlug, l.category, l.state);
                        }}
                      >
                        {l.status === "live" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="db-act db-act--danger"
                        onClick={async () => {
                          if (!confirm(`Delete "${l.title}"? This cannot be undone.`)) return;
                          const { supabase } = await import("@/lib/supabase-client");
                          const { error } = await supabase
                            .from("listings")
                            .update({ status: "deleted" })
                            .eq("id", Number(l.id));
                          if (error) { toast.error("Delete failed. Please try again."); return; }
                          setDbListings((prev) => prev.filter((x) => x.id !== l.id));
                          toast.success("Listing deleted");
                          void revalidateAfterPublish(marketSlug, l.category, l.state);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ════════ LEADS ════════ */}
        {tab === "leads" && (
          <>
            <h2 className="db-section-title">Leads</h2>

            <div className="db-ftabs">
              {(["all", "new", "viewing", "responded"] as const).map((f) => {
                const count = f === "all" ? allLeads.length
                  : f === "new"       ? allLeads.filter((l) => l.status === "new").length
                  : f === "viewing"   ? allLeads.filter((l) => l.status === "viewed").length
                  : allLeads.filter((l) => l.status === "replied" || l.status === "closed").length;
                return (
                  <button
                    key={f}
                    className={`db-ftab${leadFilter === f ? " active" : ""}`}
                    onClick={() => setLeadFilter(f)}
                  >
                    {f === "all" ? "All" : f === "new" ? "New" : f === "viewing" ? "Viewed" : "Responded"}
                    <span className="db-ftab__ct">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="db-panel">
              {leadsLoading ? (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clay)" }}>
                  Loading leads…
                </div>
              ) : filteredLeads.length === 0 ? (
                <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--clay)" }}>
                  {allLeads.length === 0
                    ? "No enquiries yet. Share your listing to start receiving leads."
                    : "No leads in this category."}
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const initials = lead.senderName
                    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const diff = Date.now() - new Date(lead.createdAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  const timeAgo = mins < 60 ? `${mins}m ago`
                    : mins < 1440 ? `${Math.floor(mins / 60)}h ago`
                    : `${Math.floor(mins / 1440)}d ago`;
                  const typeLabel = lead.type === "whatsapp" ? "WhatsApp"
                    : lead.type === "viewing" ? "Viewing" : "Message";
                  const statusPill = lead.status === "new" ? "db-pill--live"
                    : lead.status === "viewed" ? "db-pill--review" : "db-pill--draft";
                  const statusLabel = lead.status === "new" ? "New"
                    : lead.status === "viewed" ? "Viewed"
                    : lead.status === "replied" ? "Replied" : "Closed";
                  const isDb = lead.id.startsWith("db_");

                  const markStatus = async (status: "replied" | "closed") => {
                    if (isDb) {
                      const { getAccessToken } = await import("@/lib/supabase-client");
                      const token = await getAccessToken();
                      if (token) await updateDbLeadStatus(lead.id, status, token).catch(() => {});
                      setAllLeads((prev) =>
                        prev.map((l) => l.id === lead.id ? { ...l, status } : l)
                      );
                    } else {
                      updateLeadStatus(lead.id, status);
                      setAllLeads((prev) =>
                        prev.map((l) => l.id === lead.id ? { ...l, status } : l)
                      );
                    }
                  };

                  return (
                    <div className="db-lead" key={lead.id}>
                      <div className="db-lead__av">{initials}</div>
                      <div className="db-lead__body">
                        <div className="db-lead__top">
                          <span className="db-lead__name">{lead.senderName}</span>
                          <span className="db-lead__time">{timeAgo}</span>
                          <span className="db-lead__listing">{lead.listingTitle.split(",")[0]}</span>
                          <span className={`db-pill ${statusPill}`}>{statusLabel}</span>
                          <span className="db-lead__listing" style={{ color: "var(--clay)", fontWeight: 400 }}>{typeLabel}</span>
                        </div>
                        {lead.message && <p className="db-lead__msg">{lead.message}</p>}
                        {lead.viewingDate && (
                          <p className="db-lead__msg">
                            Viewing requested: {lead.viewingDate} at {lead.viewingTime}
                          </p>
                        )}
                        {lead.senderPhone && (
                          <p className="db-lead__msg" style={{ fontSize: 12 }}>
                            📞 {lead.senderPhone}{lead.senderEmail ? ` · ${lead.senderEmail}` : ""}
                          </p>
                        )}
                        <div className="db-lead__actions">
                          {lead.senderPhone && (
                            <a
                              className="db-wa-btn"
                              href={`https://wa.me/${lead.senderPhone.replace(/^0/, "234").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${lead.senderName}, thanks for your enquiry on ${lead.listingTitle}.`)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </a>
                          )}
                          <button className="db-act" onClick={() => markStatus("replied")}>
                            Mark replied
                          </button>
                          <button className="db-act" onClick={() => markStatus("closed")}>
                            Close
                          </button>
                        </div>
                      </div>
                      <div className="db-lead__score">
                        <span className={`db-score ${scoreClass(lead.score)}`}>
                          <ScoreIcon score={lead.score} /> {scoreLabel(lead.score)} · {lead.score}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ════════ ANALYTICS ════════ */}
        {tab === "analytics" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="db-section-title" style={{ marginBottom: 0 }}>Analytics</h2>
              <div className="db-ftabs" style={{ marginBottom: 0, width: "auto", gap: 3 }}>
                {(["7d", "30d"] as const).map((p) => (
                  <button
                    key={p}
                    className={`db-ftab${period === p ? " active" : ""}`}
                    onClick={() => setPeriod(p)}
                    style={{ flex: "none", padding: "6px 16px" }}
                  >
                    {p === "7d" ? "Last 7 days" : "Last 30 days"}
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--clay)", fontSize: 14 }}>
                Loading analytics…
              </div>
            ) : !analyticsData ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--clay)", fontSize: 14 }}>
                No analytics data available yet.
              </div>
            ) : (() => {
              const chartData = analyticsData.daily.map((d) => d.views);
              const chartMax = Math.max(...chartData, 1);
              const total = analyticsData.totals.views;
              const avgDaily = Math.round(total / chartData.length);

              return (
                <>
                  {/* Views chart */}
                  <div className="db-panel">
                    <div className="db-panel__head">
                      <h3>Listing views</h3>
                      <span className="db-panel__meta">
                        {period === "7d" ? "Last 7 days" : "Last 30 days"} · all listings
                      </span>
                    </div>
                    <div style={{ padding: "20px 18px 32px" }}>
                      <div className="db-chart">
                        {chartData.map((v, i) => {
                          const isPeak = v === chartMax && v > 0;
                          const heightPct = Math.max(4, Math.round((v / chartMax) * 100));
                          const lbl = period === "7d"
                            ? DAYS_7[new Date(analyticsData.daily[i].date).getUTCDay()]
                            : `${i + 1}`;
                          return (
                            <div className="db-chart__col" key={i}>
                              <div
                                className={`db-chart__bar${isPeak ? " db-chart__bar--peak" : ""}`}
                                style={{ height: `${heightPct}%` }}
                                title={`${v} views · ${analyticsData.daily[i].date}`}
                              />
                              {(period === "7d" || i % 5 === 0) && (
                                <span className="db-chart__lbl">{lbl}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="db-chart-stats">
                        <div className="db-chart-stat">
                          <div className="db-chart-stat__n">{total.toLocaleString()}</div>
                          <div className="db-chart-stat__l">Total views</div>
                        </div>
                        <div className="db-chart-stat">
                          <div className="db-chart-stat__n">{avgDaily}</div>
                          <div className="db-chart-stat__l">Daily avg</div>
                        </div>
                        <div className="db-chart-stat">
                          <div className="db-chart-stat__n">{chartMax === 1 && total === 0 ? 0 : chartMax}</div>
                          <div className="db-chart-stat__l">Peak day</div>
                        </div>
                        <div className="db-chart-stat">
                          <div className="db-chart-stat__n">{analyticsData.totals.leads}</div>
                          <div className="db-chart-stat__l">Enquiries</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top performers table */}
                  <div className="db-panel">
                    <div className="db-panel__head">
                      <h3>Top performers</h3>
                      <span className="db-panel__meta">By conversion rate · {period === "7d" ? "7 days" : "30 days"}</span>
                    </div>
                    {analyticsData.byListing.length === 0 ? (
                      <div style={{ padding: "24px 18px", color: "var(--clay)", fontSize: 14 }}>
                        No active listings with views yet.
                      </div>
                    ) : (
                      <table className="db-table">
                        <thead>
                          <tr>
                            <th>Listing</th>
                            <th>Views</th>
                            <th>Leads</th>
                            <th>Conversion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.byListing.map((r) => {
                            const conv = r.views > 0 ? (r.leads / r.views) * 100 : 0;
                            return (
                              <tr key={r.id}>
                                <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {r.title}
                                </td>
                                <td>{r.views.toLocaleString()}</td>
                                <td>{r.leads}</td>
                                <td>
                                  <div className="db-conv">
                                    {conv.toFixed(1)}%
                                    <div className="db-conv__bar">
                                      <div
                                        className="db-conv__fill"
                                        style={{ width: `${Math.min(100, conv * 10)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}
        {/* ════════ REVIEWS ════════ */}
        {tab === "reviews" && (
          <>
            <h2 className="db-section-title">Reviews</h2>

            {reviewsLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--clay)", fontSize: 14 }}>
                Loading reviews…
              </div>
            ) : (
              <>
                {/* Rating summary */}
                <div className="db-panel">
                  <div className="db-panel__head">
                    <h3>Rating summary</h3>
                    {agentProfileSlug && (
                      <a
                        href={`/${marketSlug}/agent/${agentProfileSlug}#reviews`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="db-act"
                      >
                        Share profile →
                      </a>
                    )}
                  </div>
                  {agentReviewCount > 0 ? (
                    <div style={{ padding: "18px", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 20, color: "var(--gold-deep)", letterSpacing: 2 }}>
                        {"★".repeat(Math.round(agentRating))}
                        {"☆".repeat(5 - Math.round(agentRating))}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>
                        {agentRating.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--clay)" }}>
                        from {agentReviewCount} review{agentReviewCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "18px 18px 22px" }}>
                      <p style={{ margin: "0 0 12px", color: "var(--clay)", fontSize: 14 }}>
                        No reviews yet. Share your profile link with past clients to get your first review.
                      </p>
                      {agentProfileSlug && (
                        <div className="db-rev__link-box">
                          mypropertyconnect.ng/{marketSlug}/agent/{agentProfileSlug}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* All reviews */}
                {reviewItems.length > 0 && (
                  <div className="db-panel">
                    <div className="db-panel__head">
                      <h3>All reviews ({reviewItems.length})</h3>
                    </div>
                    <div style={{ padding: "0 18px 18px" }}>
                      {reviewItems.map((r) => (
                        <div key={r.id} className={`db-rev__item${!r.approved ? " db-rev__item--pending" : ""}`}>
                          <div className="db-rev__item-head">
                            <span className="db-rev__item-stars">
                              {"★".repeat(r.rating)}
                              {"☆".repeat(5 - r.rating)}
                            </span>
                            <span className="db-rev__item-name">{r.name}</span>
                            {!r.approved && (
                              <span className="db-rev__pending-badge">Pending</span>
                            )}
                            <span className="db-rev__item-date">
                              {new Date(r.created_at).toLocaleDateString("en-NG", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="db-rev__item-comment">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ════════ SETTINGS ════════ */}
        {tab === "settings" && (
          <>
            <h2 className="db-section-title">Profile Settings</h2>

            {settingsLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--clay)", fontSize: 14 }}>
                Loading your profile…
              </div>
            ) : (
              <>
                {/* ── Personal Information ── */}
                <div className="db-panel">
                  <div className="db-panel__head">
                    <h3>Personal information</h3>
                  </div>
                  <div className="db-form">
                    <div className="db-form__row">
                      <label className="db-form__label" htmlFor="set-name">Display name</label>
                      <input
                        id="set-name"
                        className="db-form__input"
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Your full name"
                        maxLength={80}
                      />
                    </div>

                    <div className="db-form__row">
                      <label className="db-form__label" htmlFor="set-phone">Phone number</label>
                      <input
                        id="set-phone"
                        className="db-form__input"
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="080XXXXXXXX"
                        maxLength={20}
                      />
                      <p className="db-form__hint">Shown to buyers after they submit an enquiry.</p>
                    </div>

                    <div className="db-form__row">
                      <label className="db-form__label">Email address</label>
                      <input
                        className="db-form__input db-form__input--readonly"
                        type="email"
                        value={authUser.email}
                        readOnly
                      />
                      <p className="db-form__hint">Email changes require identity re-verification. Contact support.</p>
                    </div>
                  </div>
                </div>

                {/* ── Professional Details ── */}
                <div className="db-panel">
                  <div className="db-panel__head">
                    <h3>Professional details</h3>
                    <span className="db-panel__meta">Shown on your public profile</span>
                  </div>
                  <div className="db-form">
                    <div className="db-form__row">
                      <label className="db-form__label" htmlFor="set-bio">Bio / About you</label>
                      <textarea
                        id="set-bio"
                        className="db-form__input db-form__textarea"
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        placeholder="Tell buyers about your experience, speciality areas, and approach…"
                        rows={4}
                        maxLength={600}
                      />
                      <p className="db-form__hint">{formBio.length}/600 characters</p>
                    </div>

                    <div className="db-form__row">
                      <label className="db-form__label" htmlFor="set-cities">Areas you cover</label>
                      <input
                        id="set-cities"
                        className="db-form__input"
                        type="text"
                        value={formCities}
                        onChange={(e) => setFormCities(e.target.value)}
                        placeholder="Lagos, Abuja, Port Harcourt"
                      />
                      <p className="db-form__hint">Separate multiple areas with commas.</p>
                      {formCities.trim() && (
                        <div className="db-form__chips">
                          {formCities.split(",").map((c) => c.trim()).filter(Boolean).map((c) => (
                            <span key={c} className="db-form__chip">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="db-form__row">
                      <label className="db-form__label" htmlFor="set-spec">Specialisations</label>
                      <input
                        id="set-spec"
                        className="db-form__input"
                        type="text"
                        value={formSpecialisation}
                        onChange={(e) => setFormSpecialisation(e.target.value)}
                        placeholder="Residential sales, Luxury homes, Short-let management"
                      />
                      <p className="db-form__hint">Separate multiple specialisations with commas.</p>
                      {formSpecialisation.trim() && (
                        <div className="db-form__chips">
                          {formSpecialisation.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                            <span key={s} className="db-form__chip">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Save button ── */}
                <div className="db-form__footer">
                  <button
                    className="db-form__save"
                    onClick={handleSaveSettings}
                    disabled={settingsSaving || !formName.trim()}
                  >
                    {settingsSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav className="db-mobnav" role="navigation" aria-label="Dashboard tabs">
        <div className="db-mobnav__inner">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              className={`db-mobnav__item${tab === n.id ? " active" : ""}`}
              onClick={() => setTab(n.id)}
              aria-current={tab === n.id ? "page" : undefined}
            >
              {n.dot && tab !== n.id && <span className="db-mobnav__dot" />}
              <span className="db-mobnav__icon">
                <n.Icon size={20} strokeWidth={1.8} />
              </span>
              <span className="db-mobnav__label">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
