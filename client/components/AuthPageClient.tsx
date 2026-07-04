"use client";

import { useRouter } from "next/navigation";
import { AuthFlow } from "@/components/AuthFlow";
import { AuthUser } from "@/lib/auth";

interface Props {
  marketSlug: string;
  next?: string;
}

export function AuthPageClient({ marketSlug, next }: Props) {
  const router = useRouter();

  const handleSuccess = (_user: AuthUser) => {
    router.push(next ?? `/${marketSlug}/dashboard`);
  };

  return <AuthFlow marketSlug={marketSlug} onSuccess={handleSuccess} />;
}
