import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  serviceId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (serviceId: string, qty: number) => void;
  remove: (serviceId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "myret_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.serviceId === item.serviceId);
      if (existing) {
        return prev.map((i) =>
          i.serviceId === item.serviceId ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((serviceId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.serviceId !== serviceId)
        : prev.map((i) => (i.serviceId === serviceId ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((serviceId: string) => {
    setItems((prev) => prev.filter((i) => i.serviceId !== serviceId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalQty = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, totalQty, subtotal, add, setQty, remove, clear }),
    [items, totalQty, subtotal, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
