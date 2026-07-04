import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses all RLS. Never import from client components.
// Built lazily so that merely importing this module (e.g. Next.js collecting
// page data at build time) never throws just because the key isn't set in
// this environment — only actually calling getSupabaseAdmin() requires it.
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_admin) _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}
