"use client";

import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useCartStore } from "@/store/cart/cart.store";

export function CartAuthSync() {
  const auth = useContext(AuthContext);
  const setAuth = useCartStore((s) => s._setAuth);
  const refetchCart = useCartStore((s) => s.refetchCart);
  const syncLocalToDB = useCartStore((s) => s.syncLocalToDB);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (auth?.loading !== false) return;
    const isAuth = auth?.isAuthenticated ?? false;
    setAuth(isAuth);
    refetchCart();

    if (!isAuth) {
      hasSyncedRef.current = false;
      return;
    }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    syncLocalToDB().then(() => {
      // Đã xoá console.info debug lộ ra Console production ("[Cart] synced N
      // guest items") — chỉ là log debug lúc phát triển, không phục vụ chức năng,
      // không cần thiết phải lộ chi tiết nội bộ (số lượng item đồng bộ) cho người
      // dùng cuối xem qua DevTools.
    });
  }, [auth?.loading, auth?.isAuthenticated, setAuth, refetchCart, syncLocalToDB]);

  return null;
}
