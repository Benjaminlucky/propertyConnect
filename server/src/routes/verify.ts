import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";
import { verifyNIN, verifyBVN } from "../lib/prembly.js";
import type { AuthUser } from "@supabase/supabase-js";

export const verifyRouter = Router();

type AuthReq = Request & { user: AuthUser };

const ninSchema = z.object({
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
});
const bvnSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
});

/* POST /api/v1/verify/nin ─────────────────────────────────────── */
verifyRouter.post("/nin", requireAuth, async (req, res) => {
  if (!process.env.PREMBLY_API_KEY || !process.env.PREMBLY_APP_ID) {
    res.status(503).json({ error: "NIN verification is not configured on this server." });
    return;
  }

  const parsed = ninSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]!.message });
    return;
  }

  const agentId = (req as AuthReq).user.id;

  try {
    const result = await verifyNIN(parsed.data.nin);
    const status = result.verified ? "approved" : "rejected";

    const { error } = await supabase.from("verification_submissions").upsert(
      {
        agent_id:     agentId,
        step_id:      "nin",
        status,
        data: {
          nin_number: parsed.data.nin,
          firstname:  result.firstname,
          lastname:   result.lastname,
          middlename: result.middlename,
          gender:     result.gender,
          birthdate:  result.birthdate,
        },
        submitted_at: new Date().toISOString(),
        reviewed_at:  new Date().toISOString(),
      },
      { onConflict: "agent_id,step_id" },
    );

    if (error) throw new Error(error.message);

    if (result.verified) {
      res.json({ verified: true, firstname: result.firstname, lastname: result.lastname });
    } else {
      res.status(422).json({
        verified: false,
        error: "NIN not found in the NIMC database. Please check the number and try again.",
      });
    }
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Verification failed" });
  }
});

/* POST /api/v1/verify/bvn ─────────────────────────────────────── */
verifyRouter.post("/bvn", requireAuth, async (req, res) => {
  if (!process.env.PREMBLY_API_KEY || !process.env.PREMBLY_APP_ID) {
    res.status(503).json({ error: "BVN verification is not configured on this server." });
    return;
  }

  const parsed = bvnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]!.message });
    return;
  }

  const agentId = (req as AuthReq).user.id;

  try {
    const result = await verifyBVN(parsed.data.bvn);
    const status = result.verified ? "approved" : "rejected";

    const { error } = await supabase.from("verification_submissions").upsert(
      {
        agent_id:     agentId,
        step_id:      "bvn",
        status,
        data: {
          bvn_number: parsed.data.bvn,
          firstname:  result.firstname,
          lastname:   result.lastname,
        },
        submitted_at: new Date().toISOString(),
        reviewed_at:  new Date().toISOString(),
      },
      { onConflict: "agent_id,step_id" },
    );

    if (error) throw new Error(error.message);

    if (result.verified) {
      res.json({ verified: true, firstname: result.firstname, lastname: result.lastname });
    } else {
      res.status(422).json({
        verified: false,
        error: "BVN not found. Please check the number and try again.",
      });
    }
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : "Verification failed" });
  }
});
