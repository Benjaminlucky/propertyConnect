import { notFound } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { ListingGate } from "@/components/ListingGate";
import "./list.css";
import "../auth/auth.css";

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const [{ market: slug }, sp] = await Promise.all([params, searchParams]);
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  const editId = sp.edit ? Number(sp.edit) : undefined;

  return <ListingGate marketSlug={market.slug} editId={editId} />;
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
