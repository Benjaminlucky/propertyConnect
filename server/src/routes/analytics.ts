import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const analyticsRouter = Router();

// GET /api/v1/analytics?period=7d|30d — agent-authenticated
analyticsRouter.get("/", requireAuth, async (req, res) => {
  const agentId = (req as any).user.id;
  const days = req.query.period === "7d" ? 7 : 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Agent's active listings
  const { data: listings, error: listErr } = await supabase
    .from("listings")
    .select("id, title")
    .eq("agent_id", agentId)
    .eq("status", "active");

  if (listErr) { res.status(500).json({ error: listErr.message }); return; }

  const listingIds = (listings ?? []).map((l) => l.id as number);

  if (listingIds.length === 0) {
    res.json({ daily: buildDailyBuckets(days, new Map()), byListing: [], totals: { views: 0, leads: 0 } });
    return;
  }

  // Views and enquiries in parallel
  const [{ data: views }, { data: enquiries }] = await Promise.all([
    supabase
      .from("listing_views")
      .select("listing_id, viewed_at")
      .in("listing_id", listingIds)
      .gte("viewed_at", cutoff),
    supabase
      .from("enquiries")
      .select("listing_id, created_at")
      .in("listing_id", listingIds)
      .gte("created_at", cutoff),
  ]);

  // Daily view aggregation
  const dailyMap = new Map<string, number>();
  for (const v of views ?? []) {
    const date = (v.viewed_at as string).slice(0, 10);
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
  }

  // Per-listing aggregation
  const viewsBy = new Map<number, number>();
  for (const v of views ?? []) {
    const id = v.listing_id as number;
    viewsBy.set(id, (viewsBy.get(id) ?? 0) + 1);
  }
  const leadsBy = new Map<number, number>();
  for (const e of enquiries ?? []) {
    const id = e.listing_id as number;
    leadsBy.set(id, (leadsBy.get(id) ?? 0) + 1);
  }

  const byListing = (listings ?? [])
    .map((l) => ({
      id:    l.id as number,
      title: l.title as string,
      views: viewsBy.get(l.id as number) ?? 0,
      leads: leadsBy.get(l.id as number) ?? 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  res.json({
    daily:    buildDailyBuckets(days, dailyMap),
    byListing,
    totals: {
      views: views?.length ?? 0,
      leads: enquiries?.length ?? 0,
    },
  });
});

function buildDailyBuckets(
  days: number,
  dailyMap: Map<string, number>,
): { date: string; views: number }[] {
  const out: { date: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const date = d.toISOString().slice(0, 10);
    out.push({ date, views: dailyMap.get(date) ?? 0 });
  }
  return out;
}
