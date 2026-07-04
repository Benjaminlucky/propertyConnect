import { notFound, redirect } from "next/navigation";
import { getMarket } from "@/lib/markets";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PersonaPicker } from "@/components/PersonaPicker";
import "../auth.css";

export default async function PersonaPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ market: slug }, sp] = await Promise.all([params, searchParams]);
  const market = getMarket(slug);
  if (!market || !market.live) notFound();

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${market.slug}/auth`);

  return <PersonaPicker marketSlug={market.slug} next={sp.next ?? `/${market.slug}/dashboard`} />;
}

export function generateStaticParams() {
  return [{ market: "ng" }];
}
