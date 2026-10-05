"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { productPrice, type StoreProduct, type CartItem } from "@/lib/types";
type CartLine = { product: StoreProduct; quantity: number };
type StoreContextValue = {
  products: StoreProduct[]; items: CartItem[]; lines: CartLine[]; hydrated: boolean;
  count: number; subtotal: number; add: (product: StoreProduct, quantity?: number) => boolean;
  update: (productId: string, quantity: number) => void; remove: (productId: string) => void;
  clear: () => void; toast: (message: string) => void;
};
const StoreContext = createContext<StoreContextValue | null>(null);
const storageKey = "sob-cart-v1";
function readCart(products: StoreProduct[]): CartItem[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    return raw.slice(0, 50).flatMap(item => {
      if (!item || typeof item !== "object" || typeof item.productId !== "string" || seen.has(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) return [];
      const product = products.find(p => p.id === item.productId);
      if (!product) return [];
      seen.add(item.productId);
      return [{ productId: product.id, quantity: item.quantity }];
    });
  } catch { return []; }
}
export function StoreProvider({ products, children }: { products: StoreProduct[]; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((message: string) => {
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3500);
  }, []);
  useEffect(() => {
    // Loading device-local cart after hydration prevents server/client markup mismatch.
    const load = () => { setItems(readCart(products)); setHydrated(true); };
    load();
    const sync = (event: StorageEvent) => { if (event.key === storageKey) load(); };
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("storage", sync); if (timer.current) clearTimeout(timer.current); };
  }, [products]);
  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(storageKey, JSON.stringify(items)); }
      catch { queueMicrotask(() => toast("Não foi possível salvar o carrinho neste navegador. Mantenha esta aba aberta.")); }
    }
  }, [items, hydrated, toast]);
  const lines = items.flatMap(item => { const product = products.find(p => p.id === item.productId); return product ? [{ product, quantity: item.quantity }] : []; });
  function add(product: StoreProduct, quantity = 1) {
    const existing = items.find(i => i.productId === product.id)?.quantity ?? 0;
    if (!product.active || product.stock === 0 || quantity < 1 || existing + quantity > Math.min(product.stock, 99)) { toast("Você já adicionou a quantidade disponível deste produto."); return false; }
    setItems(prev => prev.some(i => i.productId === product.id) ? prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i) : [...prev, { productId: product.id, quantity }]);
    toast(`${product.name} adicionado ao carrinho`);
    return true;
  }
  function update(productId: string, quantity: number) {
    const p = products.find(p => p.id === productId);
    if (!p || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(p.stock, 99)) return;
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }
  return <StoreContext.Provider value={{ products, items, lines, hydrated, count: items.reduce((n, i) => n + i.quantity, 0), subtotal: lines.reduce((n, i) => n + productPrice(i.product) * i.quantity, 0), add, update, remove: id => setItems(prev => prev.filter(i => i.productId !== id)), clear: () => { try { localStorage.setItem(storageKey, "[]"); } catch { /* The in-memory cart can still be cleared. */ } setItems([]); }, toast }}>
    {children}<div role="status" aria-live="polite" className={`toast ${notice ? "toast-visible" : ""}`}>{notice}</div>
  </StoreContext.Provider>;
}
export function useStore() { const store = useContext(StoreContext); if (!store) throw new Error("StoreProvider ausente"); return store; }
