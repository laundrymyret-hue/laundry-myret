// Shared catalog types + formatting helpers.
// Data is fetched live from Lovable Cloud via catalog.functions.ts — never hardcoded.

export type PricingType =
  | "per_item"
  | "per_kg"
  | "per_pair"
  | "fixed"
  | "dynamic";

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  active: boolean;
  visible: boolean;
}

export interface CatalogPricing {
  id: string;
  service_id: string;
  base_price: number;
  promotional_price: number | null;
  currency: string;
  effective_date: string;
  expiry_date: string | null;
  status: string;
}

export interface CatalogService {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  category_id: string;
  description: string | null;
  currency: string;
  pricing_type: string;
  unit: string | null;
  display_order: number;
  popularity: number;
  featured: boolean;
  active: boolean;
  bookable: boolean;
  visible: boolean;
  estimated_processing_hours: number;
  estimated_delivery_hours: number;
  // Effective pricing resolved server-side from the current pricing window.
  base_price: number | null;
  promotional_price: number | null;
}

export interface CategoryWithServices {
  category: CatalogCategory;
  services: CatalogService[];
}

export interface CategorySummary extends CatalogCategory {
  service_count: number;
  starting_price: number | null;
}

const DEFAULT_CURRENCY = "KES";
const DEFAULT_LOCALE = "en-KE";

const currencyFmt = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return currencyFmt.format(amount);
}

/** Resolve the effective price for a pricing window, given "now". */
export function pickEffectivePricing(
  pricings: CatalogPricing[],
  now: Date = new Date(),
): CatalogPricing | null {
  const ts = now.getTime();
  const candidates = pricings
    .filter((p) => p.status === "active")
    .filter((p) => new Date(p.effective_date).getTime() <= ts)
    .filter((p) => !p.expiry_date || new Date(p.expiry_date).getTime() > ts)
    .sort(
      (a, b) =>
        new Date(b.effective_date).getTime() -
        new Date(a.effective_date).getTime(),
    );
  return candidates[0] ?? null;
}

export function getEffectivePrice(service: CatalogService): number | null {
  if (service.promotional_price !== null) return service.promotional_price;
  return service.base_price;
}

export function unitLabel(service: CatalogService): string {
  switch (service.pricing_type) {
    case "per_kg":
      return "/ kg";
    case "per_pair":
      return "/ pair";
    case "fixed":
      return "flat";
    default:
      return "/ item";
  }
}

export function estimatedLabel(service: CatalogService): string {
  const h = service.estimated_delivery_hours;
  if (h <= 0) return "With order";
  if (h <= 24) return "24 hrs";
  return `${Math.round(h / 24)} days`;
}
