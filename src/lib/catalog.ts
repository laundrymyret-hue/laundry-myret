import manifest from "@/data/serviceCatalog.json";

export type PricingType = "per_item" | "per_kg" | "per_pair" | "fixed" | "dynamic";

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  active: boolean;
  visible: boolean;
}

export interface CatalogService {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  category_id: string;
  description: string;
  currency: string;
  pricing_type: PricingType;
  unit: string;
  pricing_id: string;
  display_order: number;
  popularity: number;
  featured: boolean;
  active: boolean;
  bookable: boolean;
  visible: boolean;
  estimated_processing_hours: number;
  estimated_delivery_hours: number;
}

export interface CatalogPricing {
  id: string;
  service_id: string;
  base_price: number;
  promotional_price: number | null;
  currency: string;
  status: string;
}

const tables = manifest.tables as {
  service_categories: CatalogCategory[];
  services: CatalogService[];
  service_pricing: CatalogPricing[];
};

const businessCurrency =
  (manifest.manifest?.business?.currency as string | undefined) ?? "KES";
const locale = (manifest.manifest?.business?.locale as string | undefined) ?? "en-KE";

const pricingByService = new Map(
  tables.service_pricing.map((p) => [p.service_id, p]),
);

export function getPricing(service: CatalogService): CatalogPricing | undefined {
  return pricingByService.get(service.id);
}

/** Never hardcode prices — always read the effective price from the catalog. */
export function getEffectivePrice(service: CatalogService): number {
  const p = getPricing(service);
  if (!p) return 0;
  return p.promotional_price ?? p.base_price;
}

const currencyFmt = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: businessCurrency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  // Intl renders KES as "KES 1,234" — exactly what we want.
  return currencyFmt.format(amount);
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

export interface CategoryGroup {
  category: CatalogCategory;
  services: CatalogService[];
}

/** Services fetched grouped by category, respecting visibility/active flags. */
export function getCatalogGroupedByCategory(): CategoryGroup[] {
  return tables.service_categories
    .filter((c) => c.active && c.visible)
    .sort((a, b) => a.display_order - b.display_order)
    .map((category) => ({
      category,
      services: tables.services
        .filter(
          (s) => s.category_id === category.id && s.active && s.visible,
        )
        .sort((a, b) => a.display_order - b.display_order),
    }))
    .filter((g) => g.services.length > 0);
}

export const catalogBusiness = manifest.manifest.business;
