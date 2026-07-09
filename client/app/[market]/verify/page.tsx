import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMarket } from "@/lib/markets";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { VerifyCenter } from "@/components/VerifyCenter";
import "../verify.css";

export const metadata: Metadata = {
  title: "Trust & Verification | MyPropertyConnect",
  description: "Complete your identity and licence verification to earn your Gold seal and rank higher in search results.",
};

export default async function VerifyPage({
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
      <VerifyCenter marketSlug={market.slug} />
      <SiteFooter market={market} />
    </>
  );
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
