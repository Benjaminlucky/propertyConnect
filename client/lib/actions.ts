"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/listings";

/**
 * Busts Next.js Router Cache for all pages that would show the new/updated
 * listing: the category browse index, the state sub-page, and the home page.
 *
 * Call this from a Client Component via a Server Action import after a
 * successful POST /api/v1/listings or PATCH /api/v1/listings/:id.
 */
export async function revalidateAfterPublish(
  market: string,
  category: string,
  state: string,
): Promise<void> {
  // Category browse index:  /ng/for-sale
  revalidatePath(`/${market}/${category}`, "page");

  // State sub-page:         /ng/for-sale/lagos
  if (state) {
    revalidatePath(`/${market}/${category}/${slugify(state)}`, "page");
  }

  // Home page — shows recent/featured listings
  revalidatePath(`/${market}`, "page");
}

/**
 * Busts cache for a specific listing detail page after an edit.
 * Pass the full slug path segments so we can reconstruct the URL.
 */
export async function revalidateListingDetail(
  market: string,
  category: string,
  state: string,
  lga: string,
  neighbourhood: string,
  titleId: string,
): Promise<void> {
  const path = `/${market}/${category}/${slugify(state)}/${slugify(lga)}/${slugify(neighbourhood)}/${titleId}`;
  revalidatePath(path, "page");

  // Also revalidate the category browse so the updated card appears
  await revalidateAfterPublish(market, category, state);
}
