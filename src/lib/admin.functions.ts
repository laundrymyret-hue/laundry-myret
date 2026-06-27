import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: {
  supabase: any;
  userId: string;
}): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden: admin role required");
}

/**
 * Returns whether the caller is an admin. Bootstraps the very first admin:
 * if no admin exists yet, the first authenticated caller is granted admin.
 * No-ops once any admin exists.
 */
export const adminWhoAmI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) === 0) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      return { isAdmin: true };
    }

    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

/** Admin: full catalog including every pricing row (history + future windows). */
export const adminGetCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [{ data: categories }, { data: services }, { data: pricing }] =
      await Promise.all([
        context.supabase
          .from("service_categories")
          .select("*")
          .order("display_order"),
        context.supabase.from("services").select("*").order("display_order"),
        context.supabase
          .from("service_pricing")
          .select("*")
          .order("effective_date", { ascending: false }),
      ]);
    return {
      categories: categories ?? [],
      services: services ?? [],
      pricing: pricing ?? [],
    };
  });

const pricingInput = z.object({
  id: z.string().uuid().optional(),
  service_id: z.string().uuid(),
  base_price: z.number().min(0).max(10_000_000),
  promotional_price: z.number().min(0).max(10_000_000).nullable(),
  effective_date: z.string().min(1),
  expiry_date: z.string().min(1).nullable(),
  status: z.enum(["active", "scheduled", "expired", "archived"]),
});

export type PricingInput = z.infer<typeof pricingInput>;

/** Admin: create or update a pricing window for a service. */
export const adminUpsertPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PricingInput) => pricingInput.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);

    if (data.expiry_date && new Date(data.expiry_date) <= new Date(data.effective_date)) {
      throw new Error("Expiry date must be after the effective date");
    }

    const row = {
      service_id: data.service_id,
      base_price: data.base_price,
      promotional_price: data.promotional_price,
      effective_date: data.effective_date,
      expiry_date: data.expiry_date,
      status: data.status,
      currency: "KES",
    };

    if (data.id) {
      const { data: updated, error } = await context.supabase
        .from("service_pricing")
        .update(row)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: inserted, error } = await context.supabase
      .from("service_pricing")
      .insert(row)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

/** Admin: delete a pricing window. */
export const adminDeletePricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("service_pricing")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
