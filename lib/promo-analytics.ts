import type { PromoAnalytics, PromoEventType } from "@/types/promo";

/** Tallies raw promo_events rows into the summary shape used by both the
 * per-item panel and the sitewide analytics dashboard. */
export function tallyPromoEvents(events: { event_type: PromoEventType }[]): PromoAnalytics {
  const counts: Record<PromoEventType, number> = {
    view: 0,
    popup_view: 0,
    cta_click: 0,
    whatsapp_click: 0,
    dismiss: 0,
  };
  for (const event of events) counts[event.event_type] += 1;

  const impressions = counts.view + counts.popup_view;
  const clicks = counts.cta_click + counts.whatsapp_click;
  return {
    views: counts.view,
    popupViews: counts.popup_view,
    ctaClicks: counts.cta_click,
    whatsappClicks: counts.whatsapp_click,
    dismissCount: counts.dismiss,
    conversionRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
  };
}
