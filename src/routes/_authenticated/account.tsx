import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { Navbar } from "@/components/myret/Navbar";
import { SiteFooter } from "@/components/myret/SiteFooter";
import { getMyOrders } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/catalog";

const myOrdersQuery = queryOptions({
  queryKey: ["my-orders"],
  queryFn: () => getMyOrders(),
});

export const Route = createFileRoute("/_authenticated/account")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myOrdersQuery),
  component: AccountPage,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  processing: "In progress",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AccountPage() {
  const { data: orders } = useSuspenseQuery(myOrdersQuery);

  return (
    <main className="overflow-x-hidden bg-background">
      <Navbar />
      <section className="px-5 pb-24 pt-28">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} /> Home
          </Link>
          <h1 className="mt-6 font-display text-4xl font-extrabold md:text-5xl">
            My orders
          </h1>

          {orders.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Package className="text-muted-foreground" size={26} />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">No orders yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                When you place an order it will appear here.
              </p>
              <Link
                to="/checkout"
                className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow-red"
              >
                Start an order
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-extrabold">
                        {o.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {o.fulfillment_type === "dropoff"
                          ? "Drop-off"
                          : "Pickup & delivery"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[color:var(--brand-blue)]/10 px-3 py-1 text-xs font-bold text-[color:var(--brand-blue)]">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {i.quantity} × {i.service_name}
                        </span>
                        <span>{formatPrice(i.line_total)}</span>
                      </div>
                    ))}
                    {o.addons.map((a, idx) => (
                      <div key={`a-${idx}`} className="flex justify-between">
                        <span className="text-muted-foreground">+ {a.addon_name}</span>
                        <span>{formatPrice(a.line_total)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 font-display font-extrabold">
                      <span>Total</span>
                      <span className="text-[color:var(--brand-blue)]">
                        {formatPrice(o.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
