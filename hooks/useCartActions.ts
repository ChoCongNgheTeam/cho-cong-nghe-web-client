import { useCartStore } from "@/store/cart/cart.store";

/** Chỉ lấy actions — không re-render khi cart data thay đổi */
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
