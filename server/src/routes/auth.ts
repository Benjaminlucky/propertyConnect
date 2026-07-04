import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/supabase.js";

export const authRouter = Router();

const SignUpSchema = z.object({
  email:   z.string().email(),
  password: z.string().min(8),
  name:    z.string().min(2),
  phone:   z.string().min(7),
  persona: z.enum(["agent", "landlord", "developer", "shortlet", "commercial"]),
});

// POST /api/v1/auth/signup
authRouter.post("/signup", async (req, res) => {
  const parsed = SignUpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, name, phone, persona } = parsed.data;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { name, phone, persona },
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Create agent profile row
  await supabase.from("agent_profiles").insert({
    id:               data.user.id,
    name,
    phone,
    email,
    persona,
    verification_tier: "starter",
    verified:          false,
    joined_year:       new Date().getFullYear(),
    market_ids:        ["ng"],
  });

  res.status(201).json({ userId: data.user.id });
});

// POST /api/v1/auth/signin
authRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { res.status(401).json({ error: error.message }); return; }
  res.json({ session: data.session, user: data.user });
});

// POST /api/v1/auth/signout
authRouter.post("/signout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) await supabase.auth.admin.signOut(token);
  res.json({ ok: true });
});
