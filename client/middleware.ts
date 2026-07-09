import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { MARKETS, DEFAULT_MARKET, getMarketByHost } from "@/lib/markets";

const PROTECTED_SEGMENTS = new Set(["dashboard", "list", "verify", "superadmin"]);

/**
 * Tenant resolution + Supabase session refresh at the edge.
 *
 * 1. Market resolution: hostname or first path segment → market slug.
 *    A bare path with no market slug is rewritten to the resolved market.
 * 2. Supabase: refreshes the auth token on every request so Server Components
 *    always see a valid (non-expired) session cookie.
 * 3. Protected routes (dashboard / list / verify) redirect to /{market}/auth
 *    server-side if there is no authenticated user — no client-side flash.
 *
 * Named `middleware.ts` (not Next 16's `proxy.ts`) on purpose: proxy.ts always
 * runs on the Node.js runtime with no way to opt out, and @netlify/plugin-nextjs
 * (as of 5.15.12) doesn't yet bundle that correctly — it still routes Proxy
 * through its Edge Functions bundler, which crashes trying to load a
 * Node.js-targeted bundle. middleware.ts keeps this on the Edge runtime, which
 * is what the Netlify plugin actually supports.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, static files, and root-level metadata routes.
  // icon/apple-icon/opengraph-image are extensionless (they serve image
  // content but their URL has no dot), so without this they'd fall through
  // to market rewriting below and get sent to a nonexistent /ng/icon path.
  const ROOT_METADATA_ROUTES = new Set([
    "/favicon.ico",
    "/icon",
    "/apple-icon",
    "/opengraph-image",
    "/robots.txt",
    "/sitemap.xml",
  ]);
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.includes(".") ||
    ROOT_METADATA_ROUTES.has(pathname)
  ) {
    return NextResponse.next();
  }

  // ── Market resolution ──────────────────────────────────────────────────────
  const hostMarket     = getMarketByHost(req.headers.get("host") ?? undefined);
  const firstSeg       = pathname.split("/").filter(Boolean)[0] ?? "";
  const segIsMarket    = firstSeg in MARKETS;
  const resolvedMarket = segIsMarket ? firstSeg : (hostMarket?.id ?? DEFAULT_MARKET);
  const resolvedPath   = segIsMarket
    ? pathname
    : `/${resolvedMarket}${pathname === "/" ? "" : pathname}`;

  // Build (or rebuild) the correct response with the x-market header.
  // Called once initially and again in setAll if Supabase refreshes tokens.
  function makeResponse(): NextResponse {
    if (segIsMarket) {
      const r = NextResponse.next({ request: req });
      r.headers.set("x-market", resolvedMarket);
      return r;
    }
    const url = req.nextUrl.clone();
    url.pathname = resolvedPath;
    const r = NextResponse.rewrite(url);
    r.headers.set("x-market", resolvedMarket);
    return r;
  }

  let response = makeResponse();

  // ── Supabase session refresh ───────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed values onto the request, then rebuild the response
          // so the updated tokens reach the browser.
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  // getUser() validates the JWT server-side — more secure than getSession()
  const { data: { user } } = await supabase.auth.getUser();

  // ── Protected route guard ──────────────────────────────────────────────────
  const segments    = resolvedPath.split("/").filter(Boolean);
  const isProtected = segments.length >= 2 && PROTECTED_SEGMENTS.has(segments[1]);

  if (isProtected && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = `/${resolvedMarket}/auth`;
    loginUrl.searchParams.set("next", resolvedPath);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
