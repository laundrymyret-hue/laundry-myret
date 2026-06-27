import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/myret/Navbar";
import { SiteFooter } from "@/components/myret/SiteFooter";
import { MagneticButton } from "@/components/myret/MagneticButton";
import { categoryQuery } from "@/lib/catalog.queries";
import {
  formatPrice,
  getEffectivePrice,
  unitLabel,
  estimatedLabel,
  type CatalogService,
} from "@/lib/catalog";

export const Route = createFileRoute("/services/$category")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      categoryQuery(params.category),
    );
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Services";
    return {
      meta: [
        { title: `${name} — MyRet Laundry` },
        {
          name: "description",
          content:
            loaderData?.category.description ??
            `Browse ${name} services and KES pricing from MyRet Laundry.`,
        },
        { property: "og:title", content: `${name} — MyRet Laundry` },
        {
          property: "og:description",
          content:
            loaderData?.category.description ??
            `Browse ${name} services and KES pricing from MyRet Laundry.`,
        },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: CategoryError,
  notFoundComponent: CategoryNotFound,
});

function PriceTag({ service }: { service: CatalogService }) {
  const promo = service.promotional_price;
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-lg font-extrabold text-[color:var(--brand-blue)]">
        {formatPrice(getEffectivePrice(service))}
      </span>
      <span className="text-xs text-muted-foreground">{unitLabel(service)}</span>
      {promo !== null && service.base_price !== null && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(service.base_price)}
        </span>
      )}
    </div>
  );
}

function CategoryPage() {
  const { category } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(category));
  const [query, setQuery] = useState("");

  const services = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data?.services ?? [];
    return q ? list.filter((s) => s.display_name.toLowerCase().includes(q)) : list;
  }, [data, query]);

  if (!data) return null;

  return (
    <main className="overflow-x-hidden bg-background">
      <Navbar />
      <section className="px-5 pb-16 pt-28">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={16} /> All categories
          </Link>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
                Service Catalog
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">
                {data.category.name}
              </h1>
              <p className="mt-3 text-muted-foreground">
                {data.category.description}
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this category…"
                className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm shadow-soft outline-none transition focus:border-[color:var(--brand-blue)]"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <motion.div
                key={s.id}
                whileHover={{ y: -4 }}
                className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold">
                      {s.display_name}
                    </h3>
                    {s.featured && (
                      <span className="shrink-0 rounded-full bg-[color:var(--brand-red)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--brand-red)]">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {s.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <PriceTag service={s} />
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} /> {estimatedLabel(s)}
                  </span>
                </div>

                <MagneticButton
                  href="/#cta"
                  variant="primary"
                  className="mt-4 w-full justify-center text-sm"
                >
                  Book
                </MagneticButton>
              </motion.div>
            ))}
          </div>

          {services.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">
              No services match “{query}”.
            </p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function CategoryError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function CategoryNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-bold">Category not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That service category doesn't exist or is no longer available.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
