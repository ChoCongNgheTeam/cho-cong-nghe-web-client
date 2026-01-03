// app/hooks/use-cart.ts
"use client";

import { CartItemWithDetails } from "@/lib/types/cart.types";
import { useState, useEffect, useCallback } from "react";
import {
   getCartItems,
   updateCartItemQuantity,
   removeCartItem,
   removeCartItems,
} from "@/lib/actions/cart.action";
import toast from "react-hot-toast";
interface ProductVariantAttribute {
  attributes_option?: {
    attribute?: {
      name: string;
    };
    value: string;
  };
}

interface CartItemFromAPI {
  id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: number;
  discount_value: number;
  product_variant?: {
    price?: number;
    product?: {
      name: string;
    };
    variants_attributes?: ProductVariantAttribute[];
    product_variant_images?: Array<{
      img_url: string;
    }>;
  };
}

// ============ Mock Data ============
const MOCK_CART_ITEMS: CartItemWithDetails[] = [
   {
      id: 1,
      product_variant_id: 101,
      product_name: "IPHONE 16 PRO MAX",
      variant_name: "Màu: Titan Tự Nhiên",
      price: 250000,
      original_price: 250000,
      quantity: 1,
      image_url:
         "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=300&h=300&fit=crop",
      unit_price: 250000,
      discount_value: 0,
      selected: false,
   },
   {
      id: 2,
      product_variant_id: 102,
      product_name: "MacBook Pro 14 inch M3",
      variant_name: "Màu: Space Gray, RAM: 16GB",
      price: 45000000,
      original_price: 52000000,
      quantity: 1,
      image_url:
         "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      unit_price: 45000000,
      discount_value: 7000000,
      selected: false,
   },
   {
      id: 3,
      product_variant_id: 103,
      product_name: "AirPods Pro Gen 2",
      variant_name: "Màu: Trắng",
      price: 6490000,
      original_price: 6990000,
      quantity: 2,
      image_url:
         "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300&h=300&fit=crop",
      unit_price: 6490000,
      discount_value: 500000,
      selected: false,
   },
];

const USE_MOCK_DATA = true; // ⚠️ Set false khi có database thật

export function useCart() {
   const [items, setItems] = useState<CartItemWithDetails[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [selectAll, setSelectAll] = useState(false);

  // Load cart items on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Format variant attributes to display name
  const formatVariantName = (attributes: ProductVariantAttribute[]): string => {
    if (!attributes || attributes.length === 0) return "";
    return attributes
      .map(
        attr =>
          `${attr.attributes_option?.attribute?.name}: ${attr.attributes_option?.value}`
      )
      .join(", ");
  };

   const loadCart = async () => {
      setIsLoading(true);

      // 🎨 Dùng mock data nếu USE_MOCK_DATA = true
      if (USE_MOCK_DATA) {
         setTimeout(() => {
            setItems(MOCK_CART_ITEMS);
            setIsLoading(false);
         }, 500); // Giả lập loading
         return;
      }

    try {
      const result = await getCartItems();
      if (result.success && Array.isArray(result.data)) {
        const formattedItems = result.data.map((item: CartItemFromAPI) => ({
          id: item.id,
          product_variant_id: item.product_variant_id,
          product_name: item.product_variant?.product?.name || "",
          variant_name: formatVariantName(
            item.product_variant?.variants_attributes || []
          ),
          price: item.unit_price,
          original_price: item.product_variant?.price || item.unit_price,
          quantity: item.quantity,
          image_url:
            item.product_variant?.product_variant_images?.[0]?.img_url || "",
          unit_price: item.unit_price,
          discount_value: item.discount_value,
          selected: false,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error("Không thể tải giỏ hàng. Vui lòng thử lại sau");
    } finally {
      setIsLoading(false);
    }
  };

   // Toggle select all
   const toggleSelectAll = useCallback(() => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      setItems((prev) =>
         prev.map((item) => ({ ...item, selected: newSelectAll }))
      );
   }, [selectAll]);

   // Toggle select item
   const toggleSelectItem = useCallback((id: number) => {
      setItems((prev) => {
         const updated = prev.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
         );
         setSelectAll(updated.every((item) => item.selected));
         return updated;
      });
   }, []);

   // Update quantity (mock version)
   const updateQuantity = useCallback(
      async (id: number, delta: number) => {
         const item = items.find((i) => i.id === id);
         if (!item) return;

         const newQuantity = Math.max(1, item.quantity + delta);
         if (newQuantity === item.quantity) return;

         // 🎨 Mock version - chỉ update local state
         if (USE_MOCK_DATA) {
            setItems((prev) =>
               prev.map((i) =>
                  i.id === id ? { ...i, quantity: newQuantity } : i
               )
            );
            toast.success("Đã cập nhật số lượng");
            return;
         }

         // Real API call
         setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i))
         );

    try {
      const result = await updateCartItemQuantity(id, newQuantity);
      if (!result.success) {
        setItems(prev =>
          prev.map(i => (i.id === id ? { ...i, quantity: item.quantity } : i))
        );
        toast.error("Không thể cập nhật số lượng");
      } else {
        toast.success("Đã cập nhật số lượng");
      }
    } catch (error) {
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: item.quantity } : i))
      );
      toast.error("Không thể cập nhật số lượng");
    }
  }, [items]);

   // Remove single item (mock version)
   const removeItem = useCallback(async (id: number) => {
      // 🎨 Mock version
      if (USE_MOCK_DATA) {
         setItems((prev) => prev.filter((i) => i.id !== id));
         toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
         return;
      }

      // Real API call
      setItems((prev) => prev.filter((i) => i.id !== id));

      try {
         const result = await removeCartItem(id);
         if (!result.success) {
            await loadCart();
            toast.error("Không thể xóa sản phẩm");
         } else {
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
         }
      } catch (error) {
         await loadCart();
         toast.error("Không thể xóa sản phẩm");
      }
   }, []);

   // Remove selected items (mock version)
   const removeSelectedItems = useCallback(async () => {
      const selectedIds = items.filter((i) => i.selected).map((i) => i.id);
      if (selectedIds.length === 0) return;

      // 🎨 Mock version
      if (USE_MOCK_DATA) {
         setItems((prev) => prev.filter((i) => !i.selected));
         setSelectAll(false);
         toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
         return;
      }

      // Real API call
      setItems((prev) => prev.filter((i) => !i.selected));
      setSelectAll(false);

      try {
         const result = await removeCartItems(selectedIds);
         if (!result.success) {
            await loadCart();
            toast.error("Không thể xóa sản phẩm");
         } else {
            toast.success(`Đã xóa ${selectedIds.length} sản phẩm`);
         }
      } catch (error) {
         await loadCart();
         toast.error("Không thể xóa sản phẩm");
      }
   }, [items]);

   // Calculate selected items
   const selectedItems = items.filter((item) => item.selected);

   // Calculate totals
   const subtotal = selectedItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
   );

   const totalDiscount = selectedItems.reduce(
      (sum, item) => sum + item.discount_value * item.quantity,
      0
   );

   const finalTotal = subtotal;

   const rewardPoints = Math.floor(finalTotal / 4000);

   return {
      items,
      isLoading,
      selectAll,
      selectedItems,
      toggleSelectAll,
      toggleSelectItem,
      updateQuantity,
      removeItem,
      removeSelectedItems,
      subtotal,
      totalDiscount,
      finalTotal,
      rewardPoints,
      refetch: loadCart,
   };
}
