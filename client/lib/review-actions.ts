"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

export type ReviewState = { ok: boolean; error?: string } | null;

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const agentId   = (formData.get("agentId")   as string | null)?.trim() ?? "";
  const agentSlug = (formData.get("agentSlug") as string | null)?.trim() ?? "";
  const rating    = Number(formData.get("rating"));
  const name      = (formData.get("name")      as string | null)?.trim() ?? "";
  const comment   = (formData.get("comment")   as string | null)?.trim() ?? "";

  if (!agentId || !agentSlug) return { ok: false, error: "Invalid agent." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "Please select a star rating (1–5)." };
  if (name.length < 2)
    return { ok: false, error: "Please enter your name (at least 2 characters)." };
  if (comment.length < 10)
    return { ok: false, error: "Please write a comment (at least 10 characters)." };
  if (comment.length > 600)
    return { ok: false, error: "Comment must be under 600 characters." };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("reviews").insert({
    agent_id:   agentId,
    agent_slug: agentSlug,
    rating,
    name,
    comment,
    approved:   true,
  });

  if (error) return { ok: false, error: "Could not submit your review. Please try again." };
  return { ok: true };
}
