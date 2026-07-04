import { Router } from "express";
import { supabase } from "../lib/supabase.js";

export const agentsRouter = Router();

// GET /api/v1/agents/:slug
agentsRouter.get("/:slug", async (req, res) => {
  const { data, error } = await supabase
    .from("agent_profiles")
    .select("*, listings(id, title, category_slug, price, period, neighbourhood, state, verified)")
    .eq("slug", req.params.slug)
    .single();

  if (error || !data) { res.status(404).json({ error: "Not found" }); return; }
  res.json(data);
});

// GET /api/v1/agents?market=ng&verified=1
agentsRouter.get("/", async (req, res) => {
  const { market, verified, limit = "20", offset = "0" } = req.query;

  let query = supabase
    .from("agent_profiles")
    .select("slug, name, initials, rating, review_count, verification_tier, verified, cities, specialisation")
    .order("rating", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (market)   query = query.contains("market_ids", [market]);
  if (verified) query = query.eq("verified", true);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});
