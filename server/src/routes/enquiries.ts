import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEnquiryNotification } from "../lib/email.js";

export const enquiriesRouter = Router();

const EnquirySchema = z.object({
  listing_id: z.number().int().positive(),
  mode:       z.enum(["whatsapp", "viewing", "message"]),
  name:       z.string().min(2).max(80),
  phone:      z.string().min(7).max(20).optional(),
  email:      z.string().email().max(100).optional(),
  message:    z.string().max(500).optional(),
});

// POST /api/v1/enquiries — public
enquiriesRouter.post("/", async (req, res) => {
  const parsed = EnquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const score =
    parsed.data.mode === "viewing" ? 88
    : parsed.data.mode === "message" ? 82
    : 76;

  const { data, error } = await supabase
    .from("enquiries")
    .insert({ ...parsed.data, score, status: "new" })
    .select()
    .single();

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.status(201).json(data);

  // Fire-and-forget email notification to the listing agent
  const { listing_id, mode, name, phone, message } = parsed.data;
  void (async () => {
    try {
      const { data: listing } = await supabase
        .from("listings")
        .select("title, neighbourhood, market_id, agent_profiles(name, email)")
        .eq("id", listing_id)
        .single();

      if (!listing) return;
      const ap = (listing.agent_profiles as unknown) as { name: string; email: string } | null;
      if (!ap?.email) return;

      await sendEnquiryNotification({
        agentName:     ap.name,
        agentEmail:    ap.email,
        marketId:      listing.market_id as string,
        listingTitle:  listing.title as string,
        neighbourhood: listing.neighbourhood as string,
        buyerName:     name,
        buyerPhone:    phone,
        buyerEmail:    parsed.data.email,
        mode,
        message,
      });
    } catch {
      // never let email failure crash the response
    }
  })();
});

// GET /api/v1/enquiries — agent-authenticated, returns their leads
enquiriesRouter.get("/", requireAuth, async (req, res) => {
  const agentId = (req as any).user.id;
  const { status, limit = "50", offset = "0" } = req.query;

  let query = supabase
    .from("enquiries")
    .select("*, listings!inner(agent_id, title, neighbourhood)")
    .eq("listings.agent_id", agentId)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /api/v1/enquiries/:id/status — owner only
enquiriesRouter.patch("/:id/status", requireAuth, async (req, res) => {
  const agentId = (req as any).user.id;
  const { status } = req.body as { status: string };
  if (!["new", "contacted", "viewing_booked", "closed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("enquiries")
    .select("listings!inner(agent_id)")
    .eq("id", req.params.id)
    .single();

  if (fetchErr || !existing) { res.status(404).json({ error: "Not found" }); return; }
  const owner = (existing.listings as unknown as { agent_id: string } | null)?.agent_id;
  if (owner !== agentId) { res.status(403).json({ error: "Not your lead" }); return; }

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", req.params.id);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ ok: true });
});
