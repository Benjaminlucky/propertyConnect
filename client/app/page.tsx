import { redirect } from "next/navigation";
import { DEFAULT_MARKET } from "@/lib/markets";

export default function Root() {
  redirect(`/${DEFAULT_MARKET}`);
}
