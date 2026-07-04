export type Persona =
  | "agent"
  | "landlord"
  | "developer"
  | "shortlet"
  | "commercial";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  persona: Persona;
  emailVerified: boolean;
  identityVerified: boolean;
  verificationTier: "starter" | "bronze" | "silver" | "gold";
  joinedAt: string;
}

export interface PersonaMeta {
  label: string;
  blurb: string;
  emailSequence: { timing: string; subject: string }[];
}

export const PERSONA_META: Record<Persona, PersonaMeta> = {
  agent: {
    label: "Independent Agent",
    blurb: "I list properties on behalf of owners and developers",
    emailSequence: [
      { timing: "Instantly",       subject: "Lead alert — someone enquired about your listing" },
      { timing: "Every Monday",    subject: "Your weekly performance digest: views, leads & conversion" },
      { timing: "Monthly",         subject: "Market pulse — price movements across your areas" },
      { timing: "Day 3 after list",subject: "AI listing health tips to boost your quality score" },
      { timing: "Day 85 of 90",    subject: "Re-listing reminder — your listing expires in 5 days" },
    ],
  },
  landlord: {
    label: "Landlord / Property Owner",
    blurb: "I own property and want to sell or let it directly",
    emailSequence: [
      { timing: "Instantly",    subject: "Enquiry alert — a buyer contacted you" },
      { timing: "Monthly",      subject: "Your property valuation & rental income summary" },
      { timing: "Quarterly",    subject: "Market report for your neighbourhood" },
      { timing: "Bi-annually",  subject: "Tax & legal digest from our partner advisors" },
    ],
  },
  developer: {
    label: "Developer",
    blurb: "I build and sell estate projects or off-plan units",
    emailSequence: [
      { timing: "Instantly",  subject: "Off-plan enquiry alert for [Project Name]" },
      { timing: "Weekly",     subject: "Sales velocity report — units sold vs available" },
      { timing: "Monthly",    subject: "Investor matching — buyers looking for your asset class" },
      { timing: "On milestone", subject: "Construction-stage update sent to all interested buyers" },
    ],
  },
  shortlet: {
    label: "Short-let Operator",
    blurb: "I manage short-let or serviced apartments",
    emailSequence: [
      { timing: "Instantly",  subject: "New booking request — please confirm within 2 hrs" },
      { timing: "Weekly",     subject: "Occupancy & revenue summary for your units" },
      { timing: "Thursday",   subject: "Weekend demand spike — consider raising your price" },
      { timing: "Monthly",    subject: "Availability gap alerts — fill slow weeks" },
    ],
  },
  commercial: {
    label: "Commercial / Business",
    blurb: "I lease or sell office, retail, or industrial space",
    emailSequence: [
      { timing: "Instantly",  subject: "Commercial enquiry — a business wants to view your space" },
      { timing: "Monthly",    subject: "Commercial market report for your area" },
      { timing: "Quarterly",  subject: "B2B matching — corporates searching for your space type" },
      { timing: "On expiry",  subject: "Lease expiry reminder — tenant renewal window open" },
    ],
  },
};

/* ── Real Supabase auth ───────────────────────────────────────────── */

export async function signUpWithSupabase(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  persona: Persona;
}): Promise<{ error: string | null }> {
  const { supabase } = await import("@/lib/supabase-client");
  // Point Supabase's confirmation email at our callback route so the code is
  // exchanged for a cookie session rather than a fragment-based token.
  const origin = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { name: data.name, phone: data.phone, persona: data.persona },
    },
  });
  return { error: error?.message ?? null };
}

export async function signInWithSupabase(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const { supabase } = await import("@/lib/supabase-client");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { user: null, error: error?.message ?? "Sign-in failed" };

  const meta = data.user.user_metadata as Record<string, string>;
  const u: AuthUser = {
    id:               data.user.id,
    name:             meta.name ?? email.split("@")[0],
    email:            data.user.email ?? email,
    phone:            meta.phone ?? "",
    persona:          (meta.persona as Persona) ?? "agent",
    emailVerified:    !!data.user.email_confirmed_at,
    identityVerified: false,
    verificationTier: "starter",
    joinedAt:         data.user.created_at,
  };
  storeUser(u);
  return { user: u, error: null };
}

export async function signOutWithSupabase(): Promise<void> {
  const { supabase } = await import("@/lib/supabase-client");
  await supabase.auth.signOut();
  clearUser();
}

/**
 * Unified session resolver: localStorage first (zero async cost when populated),
 * then real Supabase session as fallback. Re-syncs localStorage on the fallback
 * path so subsequent calls are instant.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  const stored = getStoredUser();
  if (stored) return stored;

  const { supabase } = await import("@/lib/supabase-client");
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const sbUser = data.session.user;
  const meta = sbUser.user_metadata as Record<string, string>;
  const u: AuthUser = {
    id:               sbUser.id,
    name:             meta.name ?? sbUser.email?.split("@")[0] ?? "",
    email:            sbUser.email ?? "",
    phone:            meta.phone ?? "",
    persona:          (meta.persona as Persona) ?? "agent",
    emailVerified:    !!sbUser.email_confirmed_at,
    identityVerified: false,
    verificationTier: "starter",
    joinedAt:         sbUser.created_at,
  };
  storeUser(u);
  return u;
}

/* ── Mock auth (localStorage) — kept for offline dev ─────────────── */

const KEY = "pc_auth";

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(u: AuthUser): void {
  if (typeof window !== "undefined")
    localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUser(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function mockSignUp(data: {
  name: string;
  email: string;
  phone: string;
  persona: Persona;
}): AuthUser {
  const u: AuthUser = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    persona: data.persona,
    emailVerified: false,
    identityVerified: false,
    verificationTier: "starter",
    joinedAt: new Date().toISOString(),
  };
  storeUser(u);
  return u;
}

export function mockVerifyEmail(u: AuthUser): AuthUser {
  const updated = { ...u, emailVerified: true };
  storeUser(updated);
  return updated;
}

export function mockSignIn(email: string): AuthUser | null {
  // In production this calls your API; here we just check localStorage
  const stored = getStoredUser();
  if (stored && stored.email.toLowerCase() === email.toLowerCase()) return stored;
  return null;
}
