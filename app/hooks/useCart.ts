import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "@/store/cart/cart.store";

/** Data hook — subscribe cart state, re-render khi data thay đổi */
export function useCartData() {
  const isLoading = useCartStore((s) => s.isLoading);
  const totalItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const selectAll = useCartStore((s) => s.items.length > 0 && s.items.every((i) => i.selected));
  const items = useCartStore(useShallow((s) => s.items));
  const rawItems = useCartStore(useShallow((s) => s.rawItems));

  // Tách selectedItems ra selector riêng với useShallow
  const selectedItems = useCartStore(useShallow((s) => s.items.filter((i) => i.selected)));

  // Gộp các computed values vào 1 selector duy nhất
  const totals = useCartStore(
    useShallow((s) => {
      const selected = s.items.filter((i) => i.selected);
      const subtotal = selected.reduce((sum, i) => sum + (i.originalPrice ?? i.unitPrice) * i.quantity, 0);
      const totalDiscount = selected.reduce((sum, i) => sum + Math.max(0, (i.originalPrice ?? 0) - i.unitPrice) * i.quantity, 0);
      const finalTotal = Math.max(0, subtotal - totalDiscount);
      return {
        subtotal,
        totalDiscount,
        finalTotal,
        rewardPoints: Math.floor(finalTotal / 1_000),
      };
    }),
  );

  return { isLoading, totalItemCount, selectAll, items, rawItems, selectedItems, ...totals };
}

/** Actions hook — KHÔNG re-render khi cart data thay đổi */
export function useCartActions() {
  const addToCart = useCartStore((s) => s.addToCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const updateItem = useCartStore((s) => s.updateItem);
  const changeVariant = useCartStore((s) => s.changeVariant);
  const removeItem = useCartStore((s) => s.removeItem);
  const removeSelectedItems = useCartStore((s) => s.removeSelectedItems);
  const toggleSelectAll = useCartStore((s) => s.toggleSelectAll);
  const toggleSelectItem = useCartStore((s) => s.toggleSelectItem);
  const refetchCart = useCartStore((s) => s.refetchCart);
  const syncLocalToDB = useCartStore((s) => s.syncLocalToDB);

  return { addToCart, updateQuantity, updateItem, changeVariant, removeItem, removeSelectedItems, toggleSelectAll, toggleSelectItem, refetchCart, syncLocalToDB };
}

/** Backward-compat: giữ useCart() cho những nơi cần cả 2 */
export function useCart() {
  return { ...useCartData(), ...useCartActions() };
}
