import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMarket } from "@/lib/markets";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { DashboardView } from "@/components/DashboardView";
import "../dashboard.css";
import "../auth/auth.css";

export const metadata: Metadata = {
  title: "Agent Dashboard | PropertyConnect",
  description: "Manage listings, track leads, and view analytics.",
};

export default async function Dashboard({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: slug } = await params;
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  return (
    <>
      <SiteHeader market={market} />
      <DashboardView marketSlug={market.slug} />
      <SiteFooter market={market} />
    </>
  );
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
