"use client";

import { useMemo, useState } from "react";
import WishlistToolbar from "./components/WishlistToolbar";
import WishlistSidebar from "./components/WishlistSidebar";
import WishlistGrid from "./components/WishlistGrid";
import WishlistPagination from "./components/WishlistPagination";
import { WishlistProduct } from "./types/wishlist";

const MOCK_WISHLIST: WishlistProduct[] = Array.from({ length: 23 }).map(
  (_, i) => ({
    id: i + 1,
    name: `Sản phẩm yêu thích ${i + 1}`,
    price: 9_990_000 + i * 300_000,
    image: "/images/mock-product.png",
  })
);

export default function WishlistPage() {
  const [limit, setLimit] = useState<4 | 8 | 12>(4);
  const [page, setPage] = useState(1);

  const totalPage = Math.ceil(MOCK_WISHLIST.length / limit);

  const data = useMemo(() => {
    const start = (page - 1) * limit;
    return MOCK_WISHLIST.slice(start, start + limit);
  }, [page, limit]);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="container py-4 text-sm text-neutral">
        Trang chủ / <span className="text-neutral-dark">Đơn hàng của tôi</span>
      </div>

      <div className="container pb-16">
        <div className="grid grid-cols-12 gap-6">
          {/* SIDEBAR */}
          <div className="col-span-12 lg:col-span-3">
            <WishlistSidebar />
          </div>

          {/* CONTENT */}
          <div className="col-span-12 lg:col-span-9">
            <h1 className="text-2xl font-semibold text-neutral-dark mb-6">
              Sản phẩm yêu thích
            </h1>

            {/* Toolbar */}
            <WishlistToolbar
              value={limit}
              onChange={(v) => {
                setLimit(v);
                setPage(1);
              }}
            />

            {/* Grid */}
            <WishlistGrid products={data} />

            {/* Pagination */}
            {totalPage > 1 && (
              <WishlistPagination
                page={page}
                total={totalPage}
                onChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
