import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  // Attach user to request for downstream handlers
  (req as Request & { user: typeof data.user }).user = data.user;
  next();
}
