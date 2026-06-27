import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowRight,
  Scale,
  Shirt,
  Briefcase,
  Sparkles,
  Baby,
  Watch,
  BedDouble,
  Sofa,
  Crown,
  Plus,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { categoriesQuery } from "@/lib/catalog.queries";
import { formatPrice } from "@/lib/catalog";

const ICONS: Record<string, LucideIcon> = {
  scale: Scale,
  iron: WashingMachine,
  shirt: Shirt,
  briefcase: Briefcase,
  sparkles: Sparkles,
  baby: Baby,
  watch: Watch,
  "bed-double": BedDouble,
  sofa: Sofa,
  crown: Crown,
  plus: Plus,
};

export function ServiceCategories() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);

  return (
    <section id="services-catalog" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[color:var(--brand-red)]">
            Service Catalog
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
            Care for everything you wear
          </h2>
          <p className="mt-4 text-muted-foreground">
            Browse by category. Transparent pricing in KES — tap any category to
            see every service and its current price.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = (c.icon && ICONS[c.icon]) || Sparkles;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              >
                <Link
                  to="/services/$category"
                  params={{ category: c.slug }}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow-red">
                      <Icon size={22} />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {c.service_count} services
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold">
                    {c.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm">
                      {c.starting_price !== null ? (
                        <>
                          <span className="text-muted-foreground">from </span>
                          <span className="font-display font-extrabold text-[color:var(--brand-blue)]">
                            {formatPrice(c.starting_price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">View pricing</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[color:var(--brand-red)] transition-transform group-hover:translate-x-1">
                      View <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
