import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getMarket } from "@/lib/markets";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { AdminView } from "./AdminView";
import { AdminLogin } from "./AdminLogin";
import type { Submission } from "./actions";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — PropertyConnect",
  robots: { index: false, follow: false },
};

const COOKIE = "pc_admin";

async function fetchQueue(): Promise<Submission[]> {
  const { data, error } = await supabaseAdmin
    .from("verification_submissions")
    .select("*, agent_profiles(name, email, slug)")
    .eq("status", "review")
    .order("submitted_at", { ascending: true });
  if (error || !data) return [];
  return data as Submission[];
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: slug } = await params;
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  // Show 404 if ADMIN_SECRET is not configured
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const isAdmin = !!token && token === adminSecret;

  if (!isAdmin) {
    return (
      <>
        <SiteHeader market={market} />
        <AdminLogin />
        <SiteFooter market={market} />
      </>
    );
  }

  const submissions = await fetchQueue();

  return (
    <>
      <SiteHeader market={market} />
      <AdminView submissions={submissions} />
      <SiteFooter market={market} />
    </>
  );
}
