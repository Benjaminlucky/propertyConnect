import { createSupabaseServer } from "@/lib/supabase-server";

export type Role = "user" | "admin" | "superadmin";

export interface CurrentAdmin {
  userId: string;
  email: string;
  role: Role;
}

const RANK: Record<Role, number> = { user: 0, admin: 1, superadmin: 2 };

/**
 * Resolves the signed-in user's own role. Reads from agent_profiles under
 * the existing "Agents manage own profile" RLS policy (id = auth.uid()) —
 * no new policy needed since this only ever reads the caller's own row.
 */
export async function getCurrentRole(): Promise<CurrentAdmin | null> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("agent_profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();
  if (error || !data) return null;

  return { userId: user.id, email: data.email as string, role: (data.role as Role) ?? "user" };
}

/**
 * Throws if the caller isn't signed in or doesn't meet the minimum role.
 * Call at the top of every superadmin server action and page.
 */
export async function requireRole(min: "admin" | "superadmin"): Promise<CurrentAdmin> {
  const current = await getCurrentRole();
  if (!current || RANK[current.role] < RANK[min]) {
    throw new Error("Unauthorized");
  }
  return current;
}
