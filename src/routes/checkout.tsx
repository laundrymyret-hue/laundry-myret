import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { Navbar } from "@/components/myret/Navbar";
import { SiteFooter } from "@/components/myret/SiteFooter";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { addonsQuery } from "@/lib/orders.queries";
import { createOrder, type PlacedOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  loader: ({ context }) => context.queryClient.ensureQueryData(addonsQuery),
  head: () => ({
    meta: [
      { title: "Checkout — MyRet Laundry" },
      {
        name: "description",
        content:
          "Confirm your laundry order, review the full cost breakdown, and book your same-day garment care with MyRet Laundry. Pay on pickup or delivery.",
      },
      { property: "og:title", content: "Checkout — MyRet Laundry" },
      {
        property: "og:description",
        content: "Place your MyRet Laundry order. Pay on pickup or delivery.",
      },
    ],
  }),
  component: CheckoutPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function CheckoutPage() {
  const { data: addons } = useSuspenseQuery(addonsQuery);
  const { items, subtotal, totalQty, selectedAddons, notes, clear } = useCart();
  const placeOrder = useServerFn(createOrder);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    fulfillment_type: "pickup_delivery" as "pickup_delivery" | "dropoff",
    address: "",
    scheduled_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  // Prefill from a logged-in session (optional login).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setForm((f) => ({
        ...f,
        customer_email: f.customer_email || u.email || "",
        customer_name:
          f.customer_name || (u.user_metadata?.full_name as string) || "",
      }));
    });
  }, []);

  const chosenAddons = useMemo(
    () =>
      addons
        .filter((a) => selectedAddons[a.slug])
        .map((a) => {
          const qty =
            a.pricing_type === "per_item" ? Math.max(totalQty, 1) : 1;
          return {
            slug: a.slug,
            name: a.name,
            description: a.description,
            qty,
            price: Number(a.price),
            lineTotal: Number(a.price) * qty,
          };
        }),
    [addons, selectedAddons, totalQty],
  );

  const addonsTotal = chosenAddons.reduce((s, a) => s + a.lineTotal, 0);
  const total = subtotal + addonsTotal;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (form.customer_name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (form.customer_phone.trim().length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (
      form.fulfillment_type === "pickup_delivery" &&
      form.address.trim().length < 5
    ) {
      toast.error("Please enter a pickup & delivery address.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeOrder({
        data: {
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          customer_email: form.customer_email.trim() || undefined,
          fulfillment_type: form.fulfillment_type,
          address: form.address.trim() || undefined,
          scheduled_at: form.scheduled_at.trim() || undefined,
          notes: notes.trim() || undefined,
          items: items.map((i) => ({ service_id: i.serviceId, qty: i.qty })),
          addon_slugs: chosenAddons.map((a) => a.slug),
        },
      });
      setPlaced(result);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not place your order.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <main className="overflow-x-hidden bg-background">
        <Navbar />
        <section className="px-5 pb-24 pt-32">
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-blue)]/10">
              <CheckCircle2 className="text-[color:var(--brand-blue)]" size={36} />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold">
              Order confirmed
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you, {placed.customer_name.split(" ")[0]}. Your order{" "}
              <span className="font-bold text-foreground">
                {placed.order_number}
              </span>{" "}
              is booked. We'll be in touch on your phone shortly.
            </p>

            <div className="mt-8 rounded-2xl border border-border p-5 text-left">
              {placed.items.map((i) => (
                <div key={i.name} className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">
                    {i.qty} × {i.name}
                  </span>
                  <span className="font-medium">{formatPrice(i.line_total)}</span>
                </div>
              ))}
              {placed.addons.map((a) => (
                <div key={a.name} className="flex justify-between py-1 text-sm">
                  <span className="text-muted-foreground">+ {a.name}</span>
                  <span className="font-medium">{formatPrice(a.line_total)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg font-extrabold">
                <span>
                  Total (pay on{" "}
                  {placed.fulfillment_type === "dropoff"
                    ? "collection"
                    : "delivery"}
                  )
                </span>
                <span className="text-[color:var(--brand-blue)]">
                  {formatPrice(placed.total)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow-red"
              >
                Back home
              </Link>
              <Link
                to="/account"
                className="rounded-full border border-border px-6 py-3 text-sm font-semibold"
              >
                View my orders
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="overflow-x-hidden bg-background">
        <Navbar />
        <section className="px-5 pb-24 pt-28">
          <div className="mx-auto max-w-2xl">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} /> Back to cart
            </Link>
            <div className="mt-10 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="text-muted-foreground" size={26} />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add services to your cart before checking out.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow-red"
              >
                Browse services
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="overflow-x-hidden bg-background">
      <Navbar />
      <section className="px-5 pb-24 pt-28">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back to cart
          </Link>
          <h1 className="mt-6 font-display text-4xl font-extrabold md:text-5xl">
            Checkout
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review your full cost breakdown and confirm your details. Pay on
            pickup or delivery — no online payment needed.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* LEFT: cost breakdown */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">
                  Cost breakdown
                </h2>

                {/* header row */}
                <div className="mt-5 hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-border pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <span>Service</span>
                  <span className="w-16 text-center">Qty</span>
                  <span className="w-24 text-right">Price</span>
                </div>

                <div className="divide-y divide-border">
                  {items.map((i) => (
                    <div
                      key={i.serviceId}
                      className="grid grid-cols-[1fr_auto] items-start gap-4 py-4 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{i.name}</p>
                        {i.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {i.description}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatPrice(i.unitPrice)} {i.unit ?? "/ item"}
                        </p>
                      </div>
                      <span className="hidden w-16 text-center text-sm font-medium sm:block">
                        {i.qty}
                      </span>
                      <span className="w-24 text-right font-display font-bold">
                        <span className="mr-2 text-xs font-normal text-muted-foreground sm:hidden">
                          ×{i.qty}
                        </span>
                        {formatPrice(i.unitPrice * i.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {chosenAddons.length > 0 && (
                  <>
                    <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Additions
                    </h3>
                    <div className="divide-y divide-border">
                      {chosenAddons.map((a) => (
                        <div
                          key={a.slug}
                          className="grid grid-cols-[1fr_auto] items-start gap-4 py-4 sm:grid-cols-[1fr_auto_auto]"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">{a.name}</p>
                            {a.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {a.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatPrice(a.price)}
                              {a.qty > 1 ? " / item" : " flat"}
                            </p>
                          </div>
                          <span className="hidden w-16 text-center text-sm font-medium sm:block">
                            {a.qty}
                          </span>
                          <span className="w-24 text-right font-display font-bold">
                            <span className="mr-2 text-xs font-normal text-muted-foreground sm:hidden">
                              ×{a.qty}
                            </span>
                            {formatPrice(a.lineTotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {notes.trim() && (
                  <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Special notes
                    </p>
                    <p className="mt-1 text-sm">{notes}</p>
                  </div>
                )}

                <div className="mt-4 text-right">
                  <Link
                    to="/cart"
                    className="text-xs font-semibold text-[color:var(--brand-blue)] hover:underline"
                  >
                    Edit cart
                  </Link>
                </div>
              </div>

              {/* details form */}
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <h2 className="font-display text-lg font-bold">Your details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <input
                      value={form.customer_name}
                      onChange={(e) => update("customer_name", e.target.value)}
                      className={inputClass}
                      placeholder="Jane Wanjiru"
                      maxLength={120}
                      required
                    />
                  </Field>
                  <Field label="Phone" required>
                    <input
                      value={form.customer_phone}
                      onChange={(e) => update("customer_phone", e.target.value)}
                      className={inputClass}
                      placeholder="07xx xxx xxx"
                      maxLength={30}
                      required
                    />
                  </Field>
                  <Field label="Email (optional)">
                    <input
                      type="email"
                      value={form.customer_email}
                      onChange={(e) => update("customer_email", e.target.value)}
                      className={inputClass}
                      placeholder="you@email.com"
                      maxLength={255}
                    />
                  </Field>
                  <Field label="Preferred date & time (optional)">
                    <input
                      value={form.scheduled_at}
                      onChange={(e) => update("scheduled_at", e.target.value)}
                      className={inputClass}
                      placeholder="Tomorrow morning"
                      maxLength={60}
                    />
                  </Field>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold">Fulfillment</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <FulfillmentOption
                      active={form.fulfillment_type === "pickup_delivery"}
                      title="Pickup & delivery"
                      desc="We collect and return to your door."
                      onClick={() =>
                        update("fulfillment_type", "pickup_delivery")
                      }
                    />
                    <FulfillmentOption
                      active={form.fulfillment_type === "dropoff"}
                      title="Drop-off at store"
                      desc="Bring your items to us, collect when ready."
                      onClick={() => update("fulfillment_type", "dropoff")}
                    />
                  </div>
                </div>

                {form.fulfillment_type === "pickup_delivery" && (
                  <div className="mt-4">
                    <Field label="Pickup & delivery address" required>
                      <input
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        className={inputClass}
                        placeholder="Apartment, street, neighbourhood (e.g. Kilimani)"
                        maxLength={400}
                      />
                    </Field>
                  </div>
                )}
              </form>
            </div>

            {/* RIGHT: summary */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold">Order total</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Services ({totalQty})
                    </span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {chosenAddons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additions</span>
                      <span className="font-medium">
                        {formatPrice(addonsTotal)}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-xl font-extrabold">
                    <span>Total</span>
                    <span className="text-[color:var(--brand-blue)]">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    Pay on{" "}
                    {form.fulfillment_type === "dropoff"
                      ? "collection"
                      : "delivery"}
                    . Same-day turnaround.
                  </p>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="mt-6 w-full rounded-full bg-gradient-brand px-6 py-4 text-sm font-semibold text-white shadow-glow-red transition hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-soft outline-none transition focus:border-[color:var(--brand-blue)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
        {required && <span className="text-[color:var(--brand-red)]"> *</span>}
      </span>
      {children}
    </label>
  );
}

function FulfillmentOption({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-blue)]/5"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <span className="flex items-center justify-between">
        <span className="font-semibold">{title}</span>
        {active && <Check size={16} className="text-[color:var(--brand-blue)]" />}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
