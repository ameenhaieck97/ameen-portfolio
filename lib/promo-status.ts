import type { EffectiveOfferStatus, Offer } from "@/types/promo";

/**
 * "Scheduled" and "expired" are never stored — an offer's admin-set status is
 * only ever "draft" or "published"; whether a published offer currently reads
 * as scheduled/active/expired is derived from start_date/end_date against the
 * current time, both here (public resolution) and in the Studio list (badges).
 */
export function getEffectiveOfferStatus(
  offer: Pick<Offer, "status" | "start_date" | "end_date">,
  now: Date = new Date(),
): EffectiveOfferStatus {
  if (offer.status === "draft") return "draft";
  const start = offer.start_date ? new Date(offer.start_date) : null;
  const end = offer.end_date ? new Date(offer.end_date) : null;
  if (start && now < start) return "scheduled";
  if (end && now > end) return "expired";
  return "active";
}
