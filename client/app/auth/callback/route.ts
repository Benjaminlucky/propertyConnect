import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Supabase redirects here after the user clicks the email-confirmation link.
// We exchange the one-time code for a real session (stored in cookies) then
// redirect to the intended destination.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/ng/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // OAuth providers (Google/Facebook) don't know the user's persona
      // (agent/landlord/developer/…) — send first-time OAuth users to pick
      // one before continuing. Email/password signups already set this at
      // signup time, so they pass straight through.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("agent_profiles")
          .select("persona_confirmed")
          .eq("id", user.id)
          .single();
        if (profile?.persona_confirmed === false) {
          const market = next.split("/")[1] || "ng";
          return NextResponse.redirect(
            `${origin}/${market}/auth/persona?next=${encodeURIComponent(next)}`
          );
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If anything goes wrong, send back to auth with an error flag.
  return NextResponse.redirect(`${origin}/ng/auth?error=callback-failed`);
}
