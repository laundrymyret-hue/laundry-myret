import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Search } from "lucide-react";
import { Reveal } from "./Reveal";
import { MagneticButton } from "./MagneticButton";
import {
  getCatalogGroupedByCategory,
  getEffectivePrice,
  getPricing,
  formatPrice,
  unitLabel,
  estimatedLabel,
  type CatalogService,
} from "@/lib/catalog";

const groups = getCatalogGroupedByCategory();

function PriceTag({ service }: { service: CatalogService }) {
  const pricing = getPricing(service);
  const promo = pricing?.promotional_price ?? null;
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-lg font-extrabold text-[color:var(--brand-blue)]">
        {formatPrice(getEffectivePrice(service))}
      </span>
      <span className="text-xs text-muted-foreground">{unitLabel(service)}</span>
      {promo !== null && pricing && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(pricing.base_price)}
        </span>
      )}
    </div>
  );
}

export function ServiceCatalog() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => activeCat === "all" || g.category.slug === activeCat)
      .map((g) => ({
        ...g,
        services: q
          ? g.services.filter((s) => s.name.toLowerCase().includes(q))
          : g.services,
      }))
      .filter((g) => g.services.length > 0);
  }, [activeCat, query]);

  return (
    <section id="catalog" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Service Catalog
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Transparent pricing in KES
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every price is fetched live from the MyRet catalog — never hardcoded.
            Browse by category or search for an item.
          </p>
        </Reveal>

        {/* Controls */}
        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm shadow-soft outline-none transition focus:border-[color:var(--brand-blue)]"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                activeCat === "all"
                  ? "border-transparent bg-gradient-brand text-white shadow-glow-red"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {groups.map((g) => (
              <button
                key={g.category.id}
                onClick={() => setActiveCat(g.category.slug)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  activeCat === g.category.slug
                    ? "border-transparent bg-gradient-brand text-white shadow-glow-red"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {g.category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div className="mt-14 space-y-16">
          <AnimatePresence mode="popLayout">
            {visibleGroups.map((g) => (
              <motion.div
                key={g.category.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <h3 className="font-display text-2xl font-extrabold">
                      {g.category.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {g.category.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                    {g.services.length} services
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.services.map((s) => (
                    <motion.div
                      key={s.id}
                      whileHover={{ y: -4 }}
                      className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display text-base font-bold">
                            {s.display_name}
                          </h4>
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
                        href="#cta"
                        variant="primary"
                        className="mt-4 w-full justify-center text-sm"
                      >
                        Book
                      </MagneticButton>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {visibleGroups.length === 0 && (
            <p className="text-center text-muted-foreground">
              No services match “{query}”.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
