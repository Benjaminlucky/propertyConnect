"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface Submission {
  id: number;
  agent_id: string;
  step_id: string;
  status: string;
  data: Record<string, string> | null;
  submitted_at: string;
  agent_profiles: { name: string; email: string; slug: string } | null;
}

const COOKIE = "pc_admin";

function secret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET not configured");
  return s;
}

async function assertAdmin(): Promise<void> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  if (!val || val !== secret()) throw new Error("Unauthorized");
}

export async function adminLogin(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const password = (formData.get("password") as string) ?? "";
  const s = process.env.ADMIN_SECRET;
  if (!s || password !== s) {
    return { error: "Incorrect password." };
  }
  const store = await cookies();
  store.set(COOKIE, s, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  redirect("/ng/admin");
}

export async function reviewSubmission(
  id: number,
  action: "approved" | "rejected",
): Promise<void> {
  await assertAdmin();
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Service role key not configured");
  const { error } = await admin
    .from("verification_submissions")
    .update({ status: action, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
