import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMarket } from "@/lib/markets";
import { getCurrentRole } from "@/lib/admin-auth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { SuperadminView } from "./SuperadminView";
import "./superadmin.css";

export const metadata: Metadata = {
  title: "Superadmin — MyPropertyConnect",
  robots: { index: false, follow: false },
};

export default async function SuperadminPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market: slug } = await params;
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  const current = await getCurrentRole();
  if (!current) redirect(`/${market.slug}/auth?next=/${market.slug}/superadmin`);
  if (current.role === "user") notFound();

  return (
    <>
      <SiteHeader market={market} />
      <SuperadminView role={current.role} marketSlug={market.slug} />
      <SiteFooter market={market} />
    </>
  );
}
