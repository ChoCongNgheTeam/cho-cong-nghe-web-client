"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import WishlistToolbar from "./components/WishlistToolbar";
import WishlistGrid from "./components/WishlistGrid";
import WishlistPagination from "./components/WishlistPagination";
import { WishlistProduct } from "./types/wishlist";

const KEY = "wishlist_products";

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [limit, setLimit] = useState<4 | 8 | 12>(4);
  const [page, setPage] = useState(1);

  const safeParse = (raw: string | null): WishlistProduct[] => {
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .map((item) => ({
          id: Number(item?.id),
          name: String(item?.name ?? ""),
          price: item?.price ?? 0,
          image: String(item?.image ?? ""),
        }))
        .filter((item) => Number.isFinite(item.id) && item.name && item.image);
    } catch {
      return [];
    }
  };

  // ✅ ổn định reference, không tạo lại mỗi render
  const load = useCallback(() => {
    const raw = localStorage.getItem(KEY);
    const data = safeParse(raw);
    setProducts(data);
  }, []);

  useEffect(() => {
    // ✅ tránh setState sync trong effect
    Promise.resolve().then(load);

    window.addEventListener("wishlist:update", load);
    return () => {
      window.removeEventListener("wishlist:update", load);
    };
  }, [load]);

  const totalPage = Math.ceil(products.length / limit);

  useEffect(() => {
    if (page > totalPage && totalPage > 0) {
      setPage(1);
    }
  }, [page, totalPage]);

  const data = useMemo(() => {
    const start = (page - 1) * limit;
    return products.slice(start, start + limit);
  }, [products, page, limit]);

  return (
    <section className="flex-1">
      <div className="mb-3 text-sm text-primary-light">
        Trang chủ / Đơn hàng của tôi
      </div>

      <h1 className="mb-4 text-xl font-semibold text-primary">
        Sản phẩm yêu thích
      </h1>

      <WishlistToolbar
        value={limit}
        onChange={(v) => {
          setLimit(v);
          setPage(1);
        }}
      />

      <WishlistGrid products={data} />

      {totalPage > 1 && (
        <WishlistPagination
          page={page}
          total={totalPage}
          onChange={setPage}
        />
      )}
    </section>
  );
}
