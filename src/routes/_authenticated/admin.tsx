import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/myret/Logo";
import {
  adminWhoAmI,
  adminGetCatalog,
  adminUpsertPricing,
  adminDeletePricing,
  type PricingInput,
} from "@/lib/admin.functions";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Pricing Admin — MyRet Laundry" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface PricingRow {
  id: string;
  service_id: string;
  base_price: number;
  promotional_price: number | null;
  effective_date: string;
  expiry_date: string | null;
  status: string;
}
interface ServiceRow {
  id: string;
  display_name: string;
  category_id: string;
  pricing_type: string;
}
interface CategoryRow {
  id: string;
  name: string;
  display_order: number;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const whoAmI = useServerFn(adminWhoAmI);
  const getCatalog = useServerFn(adminGetCatalog);

  const roleQuery = useQuery({
    queryKey: ["admin", "whoami"],
    queryFn: () => whoAmI({ data: {} as never }),
    retry: false,
  });

  const catalogQuery = useQuery({
    queryKey: ["admin", "catalog"],
    queryFn: () => getCatalog(),
    enabled: roleQuery.data?.isAdmin === true,
  });

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{
    service: ServiceRow;
    row: PricingRow | null;
  } | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (roleQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!roleQuery.data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
        <div className="max-w-md">
          <ShieldAlert className="mx-auto text-[color:var(--brand-red)]" size={40} />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn't have the admin role. Ask an existing admin to
            grant you access.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={signOut}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
            >
              Sign out
            </button>
            <Link
              to="/"
              className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories = (catalogQuery.data?.categories ?? []) as CategoryRow[];
  const services = (catalogQuery.data?.services ?? []) as ServiceRow[];
  const pricing = (catalogQuery.data?.pricing ?? []) as PricingRow[];

  const pricingByService = new Map<string, PricingRow[]>();
  for (const p of pricing) {
    const arr = pricingByService.get(p.service_id) ?? [];
    arr.push(p);
    pricingByService.set(p.service_id, arr);
  }

  const q = search.trim().toLowerCase();
  const visibleServices = q
    ? services.filter((s) => s.display_name.toLowerCase().includes(q))
    : services;

  const grouped = categories
    .sort((a, b) => a.display_order - b.display_order)
    .map((c) => ({
      category: c,
      services: visibleServices.filter((s) => s.category_id === c.id),
    }))
    .filter((g) => g.services.length > 0);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-[color:var(--brand-blue)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[color:var(--brand-blue)] sm:inline">
              Pricing Admin
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Service Pricing</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, edit and schedule pricing windows for every service.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </div>
        </div>

        {catalogQuery.isLoading && (
          <div className="mt-12 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        )}

        <div className="mt-8 space-y-10">
          {grouped.map((g) => (
            <section key={g.category.id}>
              <h2 className="font-display text-xl font-extrabold">
                {g.category.name}
              </h2>
              <div className="mt-4 space-y-4">
                {g.services.map((s) => {
                  const rows = (pricingByService.get(s.id) ?? []).sort(
                    (a, b) =>
                      new Date(b.effective_date).getTime() -
                      new Date(a.effective_date).getTime(),
                  );
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-display font-bold">{s.display_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {s.pricing_type.replace("_", " ")}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditing({ service: s, row: null })}
                          className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-glow-red"
                        >
                          <Plus size={14} /> Add price
                        </button>
                      </div>

                      {rows.length === 0 ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          No pricing yet.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="pb-2 pr-3 font-semibold">Base</th>
                                <th className="pb-2 pr-3 font-semibold">Promo</th>
                                <th className="pb-2 pr-3 font-semibold">Effective</th>
                                <th className="pb-2 pr-3 font-semibold">Expiry</th>
                                <th className="pb-2 pr-3 font-semibold">Status</th>
                                <th className="pb-2 font-semibold" />
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <PricingTableRow
                                  key={r.id}
                                  row={r}
                                  onEdit={() =>
                                    setEditing({ service: s, row: r })
                                  }
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {!catalogQuery.isLoading && grouped.length === 0 && (
            <p className="text-center text-muted-foreground">No services found.</p>
          )}
        </div>
      </div>

      {editing && (
        <PricingDialog
          service={editing.service}
          row={editing.row}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-600";
    case "scheduled":
      return "bg-amber-500/10 text-amber-600";
    case "expired":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function PricingTableRow({
  row,
  onEdit,
}: {
  row: PricingRow;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const del = useServerFn(adminDeletePricing);
  const mutation = useMutation({
    mutationFn: () => del({ data: { id: row.id } }),
    onSuccess: () => {
      toast.success("Pricing deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <tr className="border-t border-border">
      <td className="py-2 pr-3 font-semibold">{formatPrice(row.base_price)}</td>
      <td className="py-2 pr-3">
        {row.promotional_price !== null ? formatPrice(row.promotional_price) : "—"}
      </td>
      <td className="py-2 pr-3">{fmtDate(row.effective_date)}</td>
      <td className="py-2 pr-3">{fmtDate(row.expiry_date)}</td>
      <td className="py-2 pr-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColor(row.status)}`}
        >
          {row.status}
        </span>
      </td>
      <td className="py-2">
        <div className="flex justify-end gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this pricing window?")) mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-[color:var(--brand-red)]/10 hover:text-[color:var(--brand-red)]"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PricingDialog({
  service,
  row,
  onClose,
}: {
  service: ServiceRow;
  row: PricingRow | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const upsert = useServerFn(adminUpsertPricing);

  const [base, setBase] = useState(row ? String(row.base_price) : "");
  const [promo, setPromo] = useState(
    row?.promotional_price != null ? String(row.promotional_price) : "",
  );
  const [effective, setEffective] = useState(
    toLocalInput(row?.effective_date ?? new Date().toISOString()),
  );
  const [expiry, setExpiry] = useState(toLocalInput(row?.expiry_date ?? null));
  const [status, setStatus] = useState(row?.status ?? "active");

  const mutation = useMutation({
    mutationFn: (payload: PricingInput) => upsert({ data: payload }),
    onSuccess: () => {
      toast.success(row ? "Pricing updated" : "Pricing created");
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const baseNum = Number(base);
    if (!Number.isFinite(baseNum) || baseNum < 0) {
      toast.error("Enter a valid base price");
      return;
    }
    const promoNum = promo.trim() === "" ? null : Number(promo);
    if (promoNum !== null && (!Number.isFinite(promoNum) || promoNum < 0)) {
      toast.error("Enter a valid promotional price");
      return;
    }
    if (!effective) {
      toast.error("Effective date is required");
      return;
    }
    const effectiveIso = new Date(effective).toISOString();
    const expiryIso = expiry ? new Date(expiry).toISOString() : null;
    if (expiryIso && new Date(expiryIso) <= new Date(effectiveIso)) {
      toast.error("Expiry date must be after the effective date");
      return;
    }
    mutation.mutate({
      id: row?.id,
      service_id: service.id,
      base_price: baseNum,
      promotional_price: promoNum,
      effective_date: effectiveIso,
      expiry_date: expiryIso,
      status: status as PricingInput["status"],
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-extrabold">
          {row ? "Edit pricing" : "New pricing"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{service.display_name}</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">
                Base price (KES)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">
                Promo price (opt.)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              Effective date
            </span>
            <input
              type="datetime-local"
              value={effective}
              onChange={(e) => setEffective(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">
              Expiry date (optional)
            </span>
            <input
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[color:var(--brand-blue)]"
            >
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow-red disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 size={15} className="animate-spin" />}
              {row ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
