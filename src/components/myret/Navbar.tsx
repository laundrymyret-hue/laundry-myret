import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { MagneticButton } from "./MagneticButton";
import { useCart } from "@/lib/cart";

const links = [
  { label: "Services", href: "/#services-catalog" },
  { label: "How It Works", href: "/#how" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Business", href: "/#business" },
  { label: "FAQ", href: "/#faq" },
  { label: "Admin", href: "/admin" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { totalQty } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3"
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 transition-all duration-300 ${
          scrolled
            ? "glass-light shadow-soft"
            : "border border-transparent bg-white/0"
        }`}
      >
        <a href="/#top" aria-label="MyRet Laundry home">
          <Logo />
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="story-link text-sm font-medium text-[color:var(--brand-midnight)]/80 transition-colors hover:text-[color:var(--brand-blue)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/checkout"
            aria-label="View your order"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--brand-midnight)] transition-colors hover:bg-[color:var(--brand-ice)]"
          >
            <ShoppingBag size={20} />
            {totalQty > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-bold text-white">
                {totalQty}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            <MagneticButton href="/checkout" size="md">
              Schedule Pickup
            </MagneticButton>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--brand-midnight)] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-6xl rounded-3xl glass-light p-4 shadow-card md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[color:var(--brand-midnight)] hover:bg-[color:var(--brand-ice)]"
                >
                  {l.label}
                </a>
              ))}
              <MagneticButton href="/checkout" className="mt-2 w-full">
                Schedule Pickup
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
