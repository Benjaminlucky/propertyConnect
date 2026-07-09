"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/admin-auth";
import { MARKETS } from "@/lib/markets";
import { CATEGORIES } from "@/lib/categories";

const PAGE_SIZE = 20;

function adminClient() {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Service role key not configured");
  return admin;
}

function dailyBuckets(days: number, rows: { at: string }[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const date = r.at.slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  }
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const date = d.toISOString().slice(0, 10);
    out.push({ date, count: map.get(date) ?? 0 });
  }
  return out;
}

/* ── Overview ───────────────────────────────────────────────────────── */

export interface OverviewStats {
  totals: {
    listings: number;
    activeListings: number;
    agents: number;
    pendingVerification: number;
    reviews: number;
  };
  newListings30d:  { date: string; count: number }[];
  newSignups30d:   { date: string; count: number }[];
  leads30d:        { date: string; count: number }[];
}

export async function getOverviewStats(): Promise<OverviewStats> {
  await requireRole("admin");
  const admin = adminClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: listingsTotal },
    { count: activeListingsTotal },
    { count: agentsTotal },
    { count: pendingVerificationTotal },
    { count: reviewsTotal },
    { data: recentListings },
    { data: recentSignups },
    { data: recentLeads },
  ] = await Promise.all([
    admin.from("listings").select("*", { count: "exact", head: true }),
    admin.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("agent_profiles").select("*", { count: "exact", head: true }),
    admin.from("verification_submissions").select("*", { count: "exact", head: true }).eq("status", "review"),
    admin.from("reviews").select("*", { count: "exact", head: true }),
    admin.from("listings").select("created_at").gte("created_at", cutoff),
    admin.from("agent_profiles").select("created_at").gte("created_at", cutoff),
    admin.from("enquiries").select("created_at").gte("created_at", cutoff),
  ]);

  return {
    totals: {
      listings:            listingsTotal ?? 0,
      activeListings:      activeListingsTotal ?? 0,
      agents:              agentsTotal ?? 0,
      pendingVerification: pendingVerificationTotal ?? 0,
      reviews:             reviewsTotal ?? 0,
    },
    newListings30d: dailyBuckets(30, (recentListings ?? []).map((r) => ({ at: r.created_at as string }))),
    newSignups30d:  dailyBuckets(30, (recentSignups ?? []).map((r) => ({ at: r.created_at as string }))),
    leads30d:       dailyBuckets(30, (recentLeads ?? []).map((r) => ({ at: r.created_at as string }))),
  };
}

/* ── Listings moderation ───────────────────────────────────────────── */

export interface AdminListing {
  id: number;
  market_id: string;
  category_slug: string;
  title: string;
  neighbourhood: string;
  state: string;
  price: number;
  period: string;
  status: string;
  created_at: string;
  agent_profiles: { name: string; email: string; slug: string } | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listListings(params: {
  q?: string;
  marketId?: string;
  status?: string;
  page?: number;
}): Promise<Paged<AdminListing>> {
  await requireRole("admin");
  const admin = adminClient();
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("listings")
    .select("id, market_id, category_slug, title, neighbourhood, state, price, period, status, created_at, agent_profiles(name, email, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q) query = query.ilike("title", `%${params.q}%`);
  if (params.marketId) query = query.eq("market_id", params.marketId);
  if (params.status) query = query.eq("status", params.status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as unknown as AdminListing[], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function setListingStatus(
  id: number,
  status: "active" | "suspended" | "deleted",
): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin.from("listings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── User / agent management ───────────────────────────────────────── */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  persona: string;
  role: string;
  verification_tier: string;
  verified: boolean;
  created_at: string;
}

export async function listUsers(params: {
  q?: string;
  role?: string;
  tier?: string;
  page?: number;
}): Promise<Paged<AdminUser>> {
  await requireRole("admin");
  const admin = adminClient();
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("agent_profiles")
    .select("id, name, email, persona, role, verification_tier, verified, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q) query = query.or(`name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  if (params.role) query = query.eq("role", params.role);
  if (params.tier) query = query.eq("verification_tier", params.tier);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as AdminUser[], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function setVerificationTier(
  id: string,
  tier: "starter" | "bronze" | "silver" | "gold",
): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin
    .from("agent_profiles")
    .update({ verification_tier: tier, verified: tier !== "starter" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setUserBanned(id: string, banned: boolean): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: banned ? "876000h" : "none",
  });
  if (error) throw new Error(error.message);
}

/* ── Reviews moderation ─────────────────────────────────────────────── */

export interface AdminReview {
  id: number;
  agent_id: string;
  agent_slug: string;
  rating: number;
  name: string;
  comment: string;
  approved: boolean;
  created_at: string;
}

export async function listReviews(params: {
  q?: string;
  approved?: boolean;
  page?: number;
}): Promise<Paged<AdminReview>> {
  await requireRole("admin");
  const admin = adminClient();
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = admin
    .from("reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q) query = query.ilike("comment", `%${params.q}%`);
  if (params.approved !== undefined) query = query.eq("approved", params.approved);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as AdminReview[], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function setReviewApproved(id: number, approved: boolean): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin.from("reviews").update({ approved }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteReviewAdmin(id: number): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Verification queue (moved from the old /[market]/admin page) ───── */

export interface Submission {
  id: number;
  agent_id: string;
  step_id: string;
  status: string;
  data: Record<string, string> | null;
  submitted_at: string;
  reviewed_at: string | null;
  agent_profiles: { name: string; email: string; slug: string } | null;
}

export async function listVerificationQueue(): Promise<Submission[]> {
  await requireRole("admin");
  const admin = adminClient();
  const { data, error } = await admin
    .from("verification_submissions")
    .select("*, agent_profiles(name, email, slug)")
    .eq("status", "review")
    .order("submitted_at", { ascending: true });
  if (error || !data) return [];
  return data as unknown as Submission[];
}

export async function reviewVerification(
  id: number,
  action: "approved" | "rejected",
): Promise<void> {
  await requireRole("admin");
  const admin = adminClient();
  const { error } = await admin
    .from("verification_submissions")
    .update({ status: action, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Admin role management (superadmin only) ─────────────────────────── */

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function listAdmins(): Promise<AdminAccount[]> {
  await requireRole("superadmin");
  const admin = adminClient();
  const { data, error } = await admin
    .from("agent_profiles")
    .select("id, name, email, role, created_at")
    .in("role", ["admin", "superadmin"])
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as AdminAccount[];
}

export async function setUserRole(
  id: string,
  role: "user" | "admin" | "superadmin",
): Promise<void> {
  const current = await requireRole("superadmin");
  if (id === current.userId) {
    throw new Error("You can't change your own role — have another superadmin do it.");
  }
  const admin = adminClient();
  const { error } = await admin.from("agent_profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function promoteByEmail(
  email: string,
  role: "admin" | "superadmin",
): Promise<void> {
  const current = await requireRole("superadmin");
  const admin = adminClient();
  const { data, error } = await admin
    .from("agent_profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (error || !data) throw new Error("No account found with that email");
  if (data.id === current.userId) {
    throw new Error("You can't change your own role — have another superadmin do it.");
  }
  const { error: updErr } = await admin.from("agent_profiles").update({ role }).eq("id", data.id);
  if (updErr) throw new Error(updErr.message);
}

/* ── Markets & categories overview (read-only) ───────────────────────── */

export interface MarketOverview {
  id: string;
  country: string;
  flag: string;
  live: boolean;
  listingCount: number;
  agentCount: number;
}

export interface CategoryOverview {
  id: string;
  label: string;
  listingCount: number;
}

export async function getMarketsOverview(): Promise<{
  markets: MarketOverview[];
  categories: CategoryOverview[];
}> {
  await requireRole("admin");
  const admin = adminClient();

  const markets = await Promise.all(
    Object.values(MARKETS).map(async (m) => {
      const [{ count: listingCount }, { count: agentCount }] = await Promise.all([
        admin.from("listings").select("*", { count: "exact", head: true }).eq("market_id", m.id),
        admin.from("agent_profiles").select("*", { count: "exact", head: true }).contains("market_ids", [m.id]),
      ]);
      return { id: m.id, country: m.country, flag: m.flag, live: m.live, listingCount: listingCount ?? 0, agentCount: agentCount ?? 0 };
    }),
  );

  const categories = await Promise.all(
    Object.values(CATEGORIES).map(async (c) => {
      const { count } = await admin.from("listings").select("*", { count: "exact", head: true }).eq("category_slug", c.id);
      return { id: c.id, label: c.label, listingCount: count ?? 0 };
    }),
  );

  return { markets, categories };
}
