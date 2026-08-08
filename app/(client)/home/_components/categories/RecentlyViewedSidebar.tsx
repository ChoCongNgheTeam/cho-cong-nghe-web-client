"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentlyViewedProducts } from "@/lib/recommendation";
import type { Product } from "@/components/product/types";
import type { Banner } from "../../_lib/types";

interface RecentlyViewedSidebarProps {
  /** Banner dự phòng (position SIDEBAR_BOTTOM, quản lý qua trang admin Media) — hiện khi chưa có lịch sử xem. */
  fallbackBanners: Banner[];
}

// Chiều cao CỐ ĐỊNH cho cả 3 trạng thái (tải/list/banner) — không "tự khớp"
// theo chiều cao slider bên cạnh (từng bị lỗi tràn box khi có ≥3 sản phẩm, xem
// giải thích ở PR review) — cứ hiển thị đủ ~2 dòng, dư ra thì cuộn bên trong.
const WIDGET_HEIGHT = "h-[132px]";

/**
 * Đặt ngay dưới <SidebarCategoryList /> trong cùng cột sidebar (xem
 * HomeSliderSection.tsx) — lấp khoảng trống bên dưới danh mục.
 *
 * 3 trạng thái:
 *  1. Có lịch sử xem → list nhỏ (ảnh + tên + giá), cuộn dọc nếu nhiều hơn khung hiện
 *  2. Không có lịch sử → banner tĩnh (fallbackBanners[0])
 *  3. Không có cả 2 → ẩn hẳn, không để trống xấu
 */
export function RecentlyViewedSidebar({ fallbackBanners }: RecentlyViewedSidebarProps) {
  const [products, setProducts] = useState<Product[] | null>(null); // null = đang tải

  useEffect(() => {
    let cancelled = false;

    getRecentlyViewedProducts(4)
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackBanner = fallbackBanners.find((b) => b.imageUrl);

  // Đang tải — giữ đúng chỗ, tránh nháy layout
  if (products === null) {
    return <div className={`${WIDGET_HEIGHT} rounded-xl bg-neutral-light animate-pulse`} />;
  }

  if (products.length > 0) {
    return (
      <div className={`${WIDGET_HEIGHT} flex flex-col bg-surface border border-surface-border rounded-xl overflow-hidden`}>
        <div className="px-3 py-2 border-b border-surface-border shrink-0">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Đã xem gần đây</span>
        </div>
        {/* min-h-0 BẮT BUỘC ở đây — thiếu dòng này thì overflow-y-auto không cuộn được,
            div này sẽ phình cao theo đúng số lượng sản phẩm thay vì bị giới hạn bởi cha. */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-surface-border [scrollbar-width:thin]">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-light transition-colors">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-neutral-light shrink-0">
                {product.thumbnail && <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="32px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-primary leading-snug line-clamp-1">{product.name}</p>
                <p className="text-[11px] font-semibold text-accent">{product.price.final.toLocaleString("vi-VN")}đ</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!fallbackBanner) return null;

  return (
    <Link href={fallbackBanner.linkUrl ?? "#"} className={`${WIDGET_HEIGHT} relative block rounded-xl overflow-hidden border border-surface-border group`}>
      <Image src={fallbackBanner.imageUrl!} alt={fallbackBanner.title ?? ""} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="180px" />
    </Link>
  );
}
