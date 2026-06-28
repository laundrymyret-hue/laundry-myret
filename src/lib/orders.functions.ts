import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { pickEffectivePricing, type CatalogPricing } from "./catalog";

export interface Addon {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  price: number;
  pricing_type: string;
  currency: string;
  display_order: number;
}

export interface PlacedOrder {
  order_number: string;
  customer_name: string;
  fulfillment_type: string;
  subtotal: number;
  addons_total: number;
  total: number;
  currency: string;
  items: { name: string; qty: number; unit_price: number; line_total: number }[];
  addons: { name: string; qty: number; line_total: number }[];
}

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/** Public: active add-ons customers can attach to an order. */
export const getAddons = createServerFn({ method: "GET" }).handler(
  async (): Promise<Addon[]> => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("service_addons")
      .select("*")
      .eq("active", true)
      .order("display_order");
    return (data ?? []) as Addon[];
  },
);

const orderInput = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: z.string().trim().min(7).max(30),
  customer_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  fulfillment_type: z.enum(["pickup_delivery", "dropoff"]),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  scheduled_at: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        service_id: z.string().uuid(),
        qty: z.number().int().min(1).max(999),
      }),
    )
    .min(1)
    .max(100),
  addon_slugs: z.array(z.string().trim().max(60)).max(20).default([]),
});

export type OrderInput = z.infer<typeof orderInput>;

/** Public (guest-friendly): place an order. Prices are recomputed server-side. */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: OrderInput) => orderInput.parse(data))
  .handler(async ({ data }): Promise<PlacedOrder> => {
    const supabase = publicClient();

    // Optional login: associate the order with the user if a valid token is present.
    let userId: string | null = null;
    const authHeader = getRequestHeader("authorization");
    if (authHeader) {
      const userClient = createClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: authHeader } },
        },
      );
      const { data: userData } = await userClient.auth.getUser();
      userId = userData.user?.id ?? null;
    }

    const ids = data.items.map((i) => i.service_id);
    const [{ data: services }, { data: pricing }, { data: addons }] =
      await Promise.all([
        supabase.from("services").select("id, display_name").in("id", ids).eq("active", true),
        supabase.from("service_pricing").select("*").in("service_id", ids),
        data.addon_slugs.length
          ? supabase.from("service_addons").select("*").in("slug", data.addon_slugs).eq("active", true)
          : Promise.resolve({ data: [] as Addon[] }),
      ]);

    const svcById = new Map((services ?? []).map((s) => [s.id, s]));
    const pricingByService = new Map<string, CatalogPricing[]>();
    for (const p of (pricing ?? []) as CatalogPricing[]) {
      const arr = pricingByService.get(p.service_id) ?? [];
      arr.push(p);
      pricingByService.set(p.service_id, arr);
    }

    const orderItems: PlacedOrder["items"] = [];
    let subtotal = 0;
    let totalItemQty = 0;
    for (const line of data.items) {
      const svc = svcById.get(line.service_id);
      if (!svc) continue;
      const eff = pickEffectivePricing(pricingByService.get(line.service_id) ?? []);
      if (!eff) continue;
      const unit = Number(eff.promotional_price ?? eff.base_price);
      const lineTotal = unit * line.qty;
      subtotal += lineTotal;
      totalItemQty += line.qty;
      orderItems.push({
        name: svc.display_name,
        qty: line.qty,
        unit_price: unit,
        line_total: lineTotal,
      });
    }

    if (orderItems.length === 0) {
      throw new Error("No valid services in your order. Please add at least one service.");
    }

    const orderAddons: { addon_id: string; name: string; qty: number; price: number; line_total: number }[] = [];
    let addonsTotal = 0;
    for (const a of (addons ?? []) as Addon[]) {
      const qty = a.pricing_type === "per_item" ? totalItemQty : 1;
      const lineTotal = Number(a.price) * qty;
      addonsTotal += lineTotal;
      orderAddons.push({
        addon_id: a.id,
        name: a.name,
        qty,
        price: Number(a.price),
        line_total: lineTotal,
      });
    }

    const total = subtotal + addonsTotal;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        fulfillment_type: data.fulfillment_type,
        address: data.address || null,
        scheduled_at: data.scheduled_at || null,
        notes: data.notes || null,
        status: "pending",
        payment_method: "on_delivery",
        subtotal,
        addons_total: addonsTotal,
        total,
        currency: "KES",
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      throw new Error(orderErr?.message ?? "Could not create your order. Please try again.");
    }

    await supabaseAdmin.from("order_items").insert(
      orderItems.map((i, idx) => ({
        order_id: order.id,
        service_id: data.items[idx]?.service_id ?? null,
        service_name: i.name,
        unit_price: i.unit_price,
        quantity: i.qty,
        line_total: i.line_total,
      })),
    );

    if (orderAddons.length) {
      await supabaseAdmin.from("order_addons").insert(
        orderAddons.map((a) => ({
          order_id: order.id,
          addon_id: a.addon_id,
          addon_name: a.name,
          price: a.price,
          quantity: a.qty,
          line_total: a.line_total,
        })),
      );
    }

    return {
      order_number: order.order_number,
      customer_name: data.customer_name,
      fulfillment_type: data.fulfillment_type,
      subtotal,
      addons_total: addonsTotal,
      total,
      currency: "KES",
      items: orderItems,
      addons: orderAddons.map((a) => ({ name: a.name, qty: a.qty, line_total: a.line_total })),
    };
  });

export interface MyOrder {
  id: string;
  order_number: string;
  status: string;
  fulfillment_type: string;
  total: number;
  currency: string;
  created_at: string;
  items: { service_name: string; quantity: number; line_total: number }[];
  addons: { addon_name: string; line_total: number }[];
}

/** Authenticated: the signed-in user's own orders with line items. */
export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyOrder[]> => {
    const { data: orders } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, status, fulfillment_type, total, currency, created_at, order_items(service_name, quantity, line_total), order_addons(addon_name, line_total)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    return ((orders ?? []) as any[]).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      fulfillment_type: o.fulfillment_type,
      total: Number(o.total),
      currency: o.currency,
      created_at: o.created_at,
      items: (o.order_items ?? []).map((i: any) => ({
        service_name: i.service_name,
        quantity: i.quantity,
        line_total: Number(i.line_total),
      })),
      addons: (o.order_addons ?? []).map((a: any) => ({
        addon_name: a.addon_name,
        line_total: Number(a.line_total),
      })),
    }));
  });
