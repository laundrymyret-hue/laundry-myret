import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  pickEffectivePricing,
  type CatalogCategory,
  type CatalogPricing,
  type CatalogService,
  type CategorySummary,
  type CategoryWithServices,
} from "./catalog";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

/** Public: all active+visible categories with a service count and starting price. */
export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategorySummary[]> => {
    const supabase = publicClient();

    const [{ data: categories }, { data: services }, { data: pricing }] =
      await Promise.all([
        supabase
          .from("service_categories")
          .select("*")
          .eq("active", true)
          .eq("visible", true)
          .order("display_order"),
        supabase
          .from("services")
          .select("id, category_id")
          .eq("active", true)
          .eq("visible", true),
        supabase.from("service_pricing").select("*"),
      ]);

    const allServices = services ?? [];
    const allPricing = (pricing ?? []) as CatalogPricing[];
    const pricingByService = new Map<string, CatalogPricing[]>();
    for (const p of allPricing) {
      const arr = pricingByService.get(p.service_id) ?? [];
      arr.push(p);
      pricingByService.set(p.service_id, arr);
    }

    return (categories ?? []).map((c) => {
      const svcIds = allServices
        .filter((s) => s.category_id === c.id)
        .map((s) => s.id);
      let starting: number | null = null;
      for (const id of svcIds) {
        const eff = pickEffectivePricing(pricingByService.get(id) ?? []);
        if (!eff) continue;
        const price = eff.promotional_price ?? eff.base_price;
        if (starting === null || price < starting) starting = price;
      }
      return {
        ...(c as CatalogCategory),
        service_count: svcIds.length,
        starting_price: starting,
      };
    });
  },
);

/** Public: a single category with its services and resolved effective pricing. */
export const getCategoryWithServices = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<CategoryWithServices | null> => {
    const supabase = publicClient();

    const { data: category } = await supabase
      .from("service_categories")
      .select("*")
      .eq("slug", data.slug)
      .eq("active", true)
      .eq("visible", true)
      .maybeSingle();

    if (!category) return null;

    const { data: services } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", category.id)
      .eq("active", true)
      .eq("visible", true)
      .order("display_order");

    const svcList = services ?? [];
    const ids = svcList.map((s) => s.id);
    const { data: pricing } = ids.length
      ? await supabase.from("service_pricing").select("*").in("service_id", ids)
      : { data: [] as CatalogPricing[] };

    const pricingByService = new Map<string, CatalogPricing[]>();
    for (const p of (pricing ?? []) as CatalogPricing[]) {
      const arr = pricingByService.get(p.service_id) ?? [];
      arr.push(p);
      pricingByService.set(p.service_id, arr);
    }

    const resolved: CatalogService[] = svcList.map((s) => {
      const eff = pickEffectivePricing(pricingByService.get(s.id) ?? []);
      return {
        ...(s as Omit<CatalogService, "base_price" | "promotional_price">),
        base_price: eff ? Number(eff.base_price) : null,
        promotional_price: eff?.promotional_price ?? null,
      };
    });

    return {
      category: category as CatalogCategory,
      services: resolved,
    };
  });
