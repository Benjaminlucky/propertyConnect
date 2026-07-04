import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Public read-only singleton — for unauthenticated Server Component queries.
// No cookie access needed: RLS limits it to public/active data.
export const supabaseServer = createClient(url, key, { auth: { persistSession: false } });

// Cookie-aware factory — use in middleware and auth-gated Server Components.
// Must be awaited because cookies() is async in Next.js 15+.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — middleware handles cookie refresh
        }
      },
    },
  });
}
