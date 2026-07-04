import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { AuthPageClient } from "@/components/AuthPageClient";
import "./auth.css";

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ market: slug }, sp] = await Promise.all([params, searchParams]);
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  return <AuthPageClient marketSlug={market.slug} next={sp.next} />;
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
