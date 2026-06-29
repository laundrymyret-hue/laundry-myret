import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  Wind,
  Zap,
  Flower,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/myret/Navbar";
import { SiteFooter } from "@/components/myret/SiteFooter";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import { addonsQuery } from "@/lib/orders.queries";
import type { Addon } from "@/lib/orders.functions";

export const Route = createFileRoute("/cart")({
  loader: ({ context }) => context.queryClient.ensureQueryData(addonsQuery),
  head: () => ({
    meta: [
      { title: "Your Cart — MyRet Laundry" },
      {
        name: "description",
        content:
          "Review your laundry services, adjust quantities, add ironing, folding, pickup, delivery or priority cleaning, and add special notes before checkout.",
      },
      { property: "og:title", content: "Your Cart — MyRet Laundry" },
      {
        property: "og:description",
        content:
          "Review your MyRet Laundry services and extras before checkout. Same-day turnaround across Nairobi.",
      },
    ],
  }),
  component: CartPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

const ADDON_ICONS: Record<string, LucideIcon> = {
  wind: Wind,
  package: Package,
  truck: Truck,
  zap: Zap,
  sparkles: Sparkles,
  flower: Flower,
};

const SERVICE_AREAS = [
  "Kilimani",
  "Lavington",
  "Urban Oasis",
  "Junction Mall",
];

function CartPage() {
  const { data: addons } = useSuspenseQuery(addonsQuery);
  const {
    items,
    setQty,
    remove,
    subtotal,
    totalQty,
    selectedAddons,
    toggleAddon,
    notes,
    setNotes,
  } = useCart();

  const addonsTotal = addons
    .filter((a) => selectedAddons[a.slug])
    .reduce((sum, a) => {
      const qty = a.pricing_type === "per_item" ? Math.max(totalQty, 1) : 1;
      return sum + Number(a.price) * qty;
    }, 0);
  const total = subtotal + addonsTotal;

  return (
    <main className="overflow-x-hidden bg-background">
      <Navbar />
      <section className="px-5 pb-24 pt-28">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} /> Continue browsing
          </Link>
          <h1 className="mt-6 font-display text-4xl font-extrabold md:text-5xl">
            Your cart
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review your services, adjust quantities and pick any extras before
            checkout. Same-day turnaround — pay on pickup or delivery.
          </p>

          {items.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="text-muted-foreground" size={26} />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">
                Your cart is empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse a service category and add items to build your order.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow-red"
              >
                Browse services
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* LEFT: items + addons + notes */}
              <div className="space-y-8">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-lg font-bold">
                    Services ({totalQty})
                  </h2>
                  <div className="mt-4 divide-y divide-border">
                    {items.map((i) => (
                      <div key={i.serviceId} className="py-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold">{i.name}</p>
                            {i.description && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {i.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock size={12} /> Ready in{" "}
                                {i.estimated ?? "24 hrs"}
                              </span>
                              <span>
                                {formatPrice(i.unitPrice)} {i.unit ?? "/ item"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(i.serviceId)}
                            className="text-muted-foreground transition-colors hover:text-[color:var(--brand-red)]"
                            aria-label={`Remove ${i.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-border p-1">
                            <button
                              type="button"
                              onClick={() => setQty(i.serviceId, i.qty - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {i.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQty(i.serviceId, i.qty + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-display font-extrabold">
                            {formatPrice(i.unitPrice * i.qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-lg font-bold">Add extras</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enhance your order with ironing, folding, doorstep service
                    and more.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {addons.map((a) => (
                      <AddonCard
                        key={a.slug}
                        addon={a}
                        totalQty={totalQty}
                        selected={!!selectedAddons[a.slug]}
                        onToggle={() => toggleAddon(a.slug)}
                      />
                    ))}
                  </div>
                </div>

                {/* Special notes */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-lg font-bold">
                    Special notes
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Anything we should know? Stains, delicate fabrics, fragrance
                    preferences, or handling instructions.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-4 min-h-28 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-soft outline-none transition focus:border-[color:var(--brand-blue)]"
                    placeholder="e.g. Remove the coffee stain on the white shirt, fold the towels."
                    maxLength={1000}
                  />
                </div>

                {/* What's included / logistics */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-display text-lg font-bold">
                    What's included
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <InfoTile
                      icon={Clock}
                      title="Same-day turnaround"
                      desc="Most services ready within 24 hours."
                    />
                    <InfoTile
                      icon={Truck}
                      title="Pickup & delivery"
                      desc="Doorstep collection and return available."
                    />
                    <InfoTile
                      icon={MapPin}
                      title="Service areas"
                      desc={SERVICE_AREAS.join(" · ")}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: summary */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                  <h2 className="font-display text-lg font-bold">Summary</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Services ({totalQty})
                      </span>
                      <span className="font-medium">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {addons
                      .filter((a) => selectedAddons[a.slug])
                      .map((a) => {
                        const qty =
                          a.pricing_type === "per_item"
                            ? Math.max(totalQty, 1)
                            : 1;
                        return (
                          <div key={a.slug} className="flex justify-between">
                            <span className="text-muted-foreground">
                              + {a.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(Number(a.price) * qty)}
                            </span>
                          </div>
                        );
                      })}
                    <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-xl font-extrabold">
                      <span>Total</span>
                      <span className="text-[color:var(--brand-blue)]">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="pt-1 text-xs text-muted-foreground">
                      Pay on pickup or delivery. Same-day turnaround.
                    </p>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-brand px-6 py-4 text-sm font-semibold text-white shadow-glow-red transition hover:brightness-110"
                  >
                    Proceed to checkout <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/"
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
                  >
                    Add more services
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function InfoTile({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">
        <Icon size={17} />
      </span>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function AddonCard({
  addon,
  totalQty,
  selected,
  onToggle,
}: {
  addon: Addon;
  totalQty: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = (addon.icon && ADDON_ICONS[addon.icon]) || Sparkles;
  const computed =
    addon.pricing_type === "per_item"
      ? Number(addon.price) * Math.max(totalQty, 1)
      : Number(addon.price);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-blue)]/5"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-gradient-brand text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold">{addon.name}</span>
          {selected && (
            <Check
              size={16}
              className="shrink-0 text-[color:var(--brand-blue)]"
            />
          )}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {addon.description}
        </span>
        <span className="mt-1 block text-xs font-bold text-[color:var(--brand-blue)]">
          {formatPrice(computed)}
          {addon.pricing_type === "per_item" && (
            <span className="font-normal text-muted-foreground"> · per item</span>
          )}
        </span>
      </span>
    </motion.button>
  );
}
