import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { generateValuation } from "../lib/valuation.js";

export const listingsRouter = Router();

const CreateListingSchema = z.object({
  market_id:     z.string().min(2).max(4),
  category_slug: z.string(),
  title:         z.string().min(10).max(120),
  neighbourhood: z.string(),
  lga:           z.string(),
  state:         z.string(),
  price:         z.number().positive(),
  period:        z.enum(["", "/year", "/night", "/day"]),
  beds:          z.number().int().min(0),
  baths:         z.number().int().min(0),
  toilets:       z.number().int().min(0),
  description:   z.string().min(20).max(2000),
  attrs:         z.array(z.object({ k: z.string(), v: z.string() })).optional(),
  photo_urls:    z.array(z.string().url()).max(20).optional(),
});

// GET /api/v1/listings?market=ng&category=for-sale&state=Lagos&lga=Eti-Osa
listingsRouter.get("/", async (req, res) => {
  const { market, category, state, lga, neighbourhood, limit = "24", offset = "0" } = req.query;

  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (market)       query = query.eq("market_id", market);
  if (category)     query = query.eq("category_slug", category);
  if (state)        query = query.eq("state", state);
  if (lga)          query = query.eq("lga", lga);
  if (neighbourhood) query = query.eq("neighbourhood", neighbourhood);

  const { data, error, count } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data, count, limit: Number(limit), offset: Number(offset) });
});

// POST /api/v1/listings/:id/view — public, fire-and-forget view tracking
listingsRouter.post("/:id/view", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  res.status(202).json({ ok: true });
  // Insert after responding so the buyer never waits on this
  supabase.from("listing_views").insert({ listing_id: id }).then(() => {});
});

// GET /api/v1/listings/:id — public, active listings only (matches the list endpoint)
listingsRouter.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_attributes(*), listing_photos(id, url, position)")
    .eq("id", req.params.id)
    .eq("status", "active")
    .single();

  if (error || !data) { res.status(404).json({ error: "Not found" }); return; }
  res.json(data);
});

// POST /api/v1/listings — authenticated
listingsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = CreateListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { attrs, photo_urls, ...core } = parsed.data;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...core,
      agent_id: (req as any).user.id,
      status: "active",
    })
    .select()
    .single();

  if (error || !listing) {
    res.status(500).json({ error: error?.message ?? "Insert failed" });
    return;
  }

  // Persist EAV attributes
  if (attrs?.length) {
    await supabase.from("listing_attributes").insert(
      attrs.map((a) => ({ listing_id: listing.id, key: a.k, value: a.v }))
    );
  }

  // Persist photo URLs
  if (photo_urls?.length) {
    await supabase.from("listing_photos").insert(
      photo_urls.map((url, i) => ({
        listing_id: listing.id,
        url,
        position: i,
      }))
    );
  }

  res.status(201).json(listing);

  // Fire-and-forget: generate AI valuation and store alongside the listing
  void (async () => {
    try {
      const val = await generateValuation({
        category_slug: parsed.data.category_slug,
        neighbourhood: parsed.data.neighbourhood,
        lga:           parsed.data.lga,
        state:         parsed.data.state,
        price:         parsed.data.price,
        period:        parsed.data.period,
        beds:          parsed.data.beds,
      });
      if (val) {
        await supabase
          .from("listings")
          .update({
            valuation_low:  val.low,
            valuation_high: val.high,
            valuation_note: val.note,
          })
          .eq("id", listing.id);
      }
    } catch { /* never crash */ }
  })();
});

const UpdateListingSchema = z.object({
  title:         z.string().min(10).max(120).optional(),
  neighbourhood: z.string().optional(),
  lga:           z.string().optional(),
  state:         z.string().optional(),
  price:         z.number().positive().optional(),
  period:        z.enum(["", "/year", "/night", "/day"]).optional(),
  beds:          z.number().int().min(0).optional(),
  baths:         z.number().int().min(0).optional(),
  toilets:       z.number().int().min(0).optional(),
  description:   z.string().min(20).max(2000).optional(),
  attrs:         z.array(z.object({ k: z.string(), v: z.string() })).optional(),
  photo_urls:    z.array(z.string().url()).max(20).optional(),
});

// PATCH /api/v1/listings/:id — owner only
listingsRouter.patch("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { data: existing, error: fetchErr } = await supabase
    .from("listings")
    .select("agent_id")
    .eq("id", id)
    .single();

  if (fetchErr || !existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.agent_id !== userId) { res.status(403).json({ error: "Not your listing" }); return; }

  const parsed = UpdateListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { attrs, photo_urls, ...core } = parsed.data;

  const { data, error } = await supabase
    .from("listings")
    .update(core)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) { res.status(500).json({ error: error?.message ?? "Update failed" }); return; }

  if (attrs !== undefined) {
    await supabase.from("listing_attributes").delete().eq("listing_id", id);
    if (attrs.length) {
      await supabase.from("listing_attributes").insert(
        attrs.map((a) => ({ listing_id: id, key: a.k, value: a.v }))
      );
    }
  }

  if (photo_urls !== undefined) {
    await supabase.from("listing_photos").delete().eq("listing_id", id);
    if (photo_urls.length) {
      await supabase.from("listing_photos").insert(
        photo_urls.map((url, i) => ({ listing_id: id, url, position: i }))
      );
    }
  }

  res.json(data);
});

// DELETE /api/v1/listings/:id — owner only
listingsRouter.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { error } = await supabase
    .from("listings")
    .update({ status: "deleted" })
    .eq("id", req.params.id)
    .eq("agent_id", userId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});
