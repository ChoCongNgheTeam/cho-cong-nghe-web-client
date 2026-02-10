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

  // ✅ ổn định reference, không tạo lại mỗi render
  const load = useCallback(() => {
    const raw = localStorage.getItem(KEY);
    const data: WishlistProduct[] = raw ? JSON.parse(raw) : [];
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

  const data = useMemo(() => {
    const start = (page - 1) * limit;
    return products.slice(start, start + limit);
  }, [products, page, limit]);

  return (
    <section className="flex-1">
      <h1 className="text-xl font-semibold mb-4">Sản phẩm yêu thích</h1>

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
