import { redirect } from "next/navigation";

// The verification queue and all other admin functionality now live under
// /superadmin, gated by real Supabase-backed roles instead of the old
// shared ADMIN_SECRET cookie. This redirect keeps old bookmarks/links alive.
export default async function AdminPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market } = await params;
  redirect(`/${market}/superadmin`);
}
