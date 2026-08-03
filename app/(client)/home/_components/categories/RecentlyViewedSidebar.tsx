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

/**
 * Đặt ngay dưới <SidebarCategoryList /> trong cùng cột sidebar (xem
 * HomeSliderSection.tsx) — lấp khoảng trống bên dưới danh mục.
 *
 * 3 trạng thái:
 *  1. Đang tải xong, có lịch sử xem → 3-4 dòng sản phẩm nhỏ (ảnh + tên + giá)
 *  2. Không có lịch sử (chưa đăng nhập + chưa đồng ý cookie cá nhân hoá, hoặc
 *     chưa xem sản phẩm nào) → hiện banner tĩnh (fallbackBanners[0])
 *  3. Không có cả lịch sử lẫn banner fallback → ẩn hẳn, không để trống xấu
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

  // Đang tải — giữ chỗ, tránh nháy layout
  if (products === null) {
    return <div className="flex-1 rounded-xl bg-neutral-light animate-pulse min-h-[120px]" />;
  }

  if (products.length > 0) {
    return (
      <div className="flex-1 flex flex-col bg-surface border border-surface-border rounded-xl overflow-hidden">
        <div className="px-3 py-2.5 border-b border-surface-border">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Đã xem gần đây</span>
        </div>
        <div className="flex-1 flex flex-col divide-y divide-surface-border overflow-y-auto">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-light transition-colors">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-light shrink-0">
                {product.thumbnail && <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="40px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-primary leading-snug line-clamp-2">{product.name}</p>
                <p className="text-[12px] font-semibold text-accent mt-0.5">{product.price.final.toLocaleString("vi-VN")}đ</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!fallbackBanner) return null;

  return (
    <Link href={fallbackBanner.linkUrl ?? "#"} className="flex-1 relative rounded-xl overflow-hidden min-h-[120px] border border-surface-border group">
      <Image src={fallbackBanner.imageUrl!} alt={fallbackBanner.title ?? ""} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="180px" />
    </Link>
  );
}
