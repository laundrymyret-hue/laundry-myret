import { motion } from "motion/react";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Services",
    links: ["Dry Cleaning", "Wash & Fold", "Ironing & Pressing", "Pickup & Delivery", "Express Service"],
  },
  { title: "Company", links: ["About", "Careers", "Franchise", "Business", "Contact"] },
  { title: "Resources", links: ["How It Works", "Rewards", "Pricing", "FAQ", "Mobile Apps"] },
];

export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--brand-midnight)] px-5 pt-16 pb-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <motion.div whileHover={{ scale: 1.03 }} className="inline-block">
              <Logo variant="light" />
            </motion.div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Luxury garment care, delivered. Premium cleaning and seamless pickup &
              delivery across the city.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[color:var(--brand-red)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/55 transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} MyRet Laundry. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
