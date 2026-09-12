"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: number;
  name: string;
  productCode: string;
  imageUrl: string;
  price: number;
  discountPrice: number | null;
  unitLabel: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "web_tuanson_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, mounted]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (incoming) => {
      const qty = incoming.quantity ?? 1;
      if (qty <= 0) return;
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.id === incoming.id);
        if (idx >= 0) {
          const next = prev.slice();
          next[idx] = {
            ...next[idx],
            quantity: Math.max(1, next[idx].quantity + qty),
          };
          return next;
        }
        return [
          ...prev,
          {
            id: incoming.id,
            name: incoming.name,
            productCode: incoming.productCode,
            imageUrl: incoming.imageUrl,
            price: incoming.price,
            discountPrice: incoming.discountPrice,
            unitLabel: incoming.unitLabel,
            quantity: qty,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== productId);
      }
      return prev.map((i) =>
        i.id === productId ? { ...i, quantity: Math.round(quantity) } : i,
      );
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((s, it) => s + it.quantity, 0),
    [items],
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((s, it) => {
        const price =
          it.discountPrice && it.discountPrice > 0 ? it.discountPrice : it.price;
        return s + price * it.quantity;
      }, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalAmount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside a <CartProvider />");
  }
  return ctx;
}
