import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in server/.env\n" +
    "Find them in Supabase → Settings → API Keys:\n" +
    "  SUPABASE_URL       → Settings → General → Project URL\n" +
    "  SUPABASE_SERVICE_ROLE_KEY → Settings → API Keys → Secret key (click eye icon)"
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
