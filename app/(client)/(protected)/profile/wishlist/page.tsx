"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import WishlistToolbar from "./components/WishlistToolbar";
import WishlistGrid from "./components/WishlistGrid";
import WishlistPagination from "./components/WishlistPagination";
import { WishlistProduct } from "./types/wishlist";
import { getWishlist } from "./_lib/wishlist.api";

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [limit, setLimit] = useState<4 | 8 | 12>(4);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getWishlist();
      setProducts(data);
    } catch (err) {
      console.error("Loi lay wishlist:", err);
      setError("Khong the tai danh sach yeu thich. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const handleWishlistUpdate = () => {
      load();
    };

    window.addEventListener("wishlist:update", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlist:update", handleWishlistUpdate);
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
      <div className="mb-3 text-sm text-primary-light">Trang chu / Don hang cua toi</div>

      <h1 className="mb-4 text-xl font-semibold text-primary">San pham yeu thich</h1>

      {error ? (
        <div className="mb-4 rounded-lg border border-neutral bg-neutral-light p-4 text-sm text-promotion">
          {error}
        </div>
      ) : null}

      {!loading ? (
        <WishlistToolbar
          value={limit}
          onChange={(v) => {
            setLimit(v);
            setPage(1);
          }}
        />
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral bg-neutral-light p-6 text-sm text-primary-light">
          Dang tai danh sach yeu thich...
        </div>
      ) : (
        <WishlistGrid products={data} onToggle={load} />
      )}

      {totalPage > 1 && !loading && (
        <WishlistPagination page={page} total={totalPage} onChange={setPage} />
      )}
    </section>
  );
}
