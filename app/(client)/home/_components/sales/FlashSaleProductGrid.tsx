"use client";

import { memo } from "react";
import { Flame } from "lucide-react";
import { Slidezy } from "@/components/slider";
import HotSaleProductCard from "./HotSaleProductCard";
import { flashSale } from "./flashSaleTheme";
import type { FeaturedProduct, SaleScheduleRule } from "@/(client)/home/_lib/types";

export const FlashSaleEmptyState = memo(function FlashSaleEmptyState({ isUpcoming, dateLabel }: { isUpcoming: boolean; dateLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6" style={{ minHeight: 320 }}>
      <Flame style={{ width: 72, height: 72, color: flashSale.promotion, opacity: 0.18 }} strokeWidth={1.5} />
      <p className="text-sm font-semibold text-primary-light">{isUpcoming ? "Chương trình sale sắp diễn ra" : "Sản phẩm Sale đang được cập nhật..."}</p>
      {dateLabel && <p className="text-xs opacity-50 text-primary-light">Ngày {dateLabel}</p>}
    </div>
  );
});

export function FlashSaleSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4" style={{ minHeight: 320 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-surface-border bg-neutral-light-active animate-pulse h-52" />
      ))}
    </div>
  );
}

export const FlashSaleProductGrid = memo(function FlashSaleProductGrid({
  products,
  flashPromoRule,
  isUpcoming,
}: {
  products: FeaturedProduct[];
  flashPromoRule: SaleScheduleRule | null;
  isUpcoming: boolean;
}) {
  const renderCard = (item: FeaturedProduct, index: number) => {
    const product = {
      ...item,
      price: item.price ?? { base: item.priceOrigin ?? 0, final: item.priceOrigin ?? 0, discountAmount: 0, discountPercentage: 0, hasPromotion: false },
    };
    return <HotSaleProductCard key={`${product.id}-${index}`} product={product} index={index} flashPromoRule={flashPromoRule} isUpcoming={isUpcoming} />;
  };

  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch" style={{ minHeight: 320 }}>
        {products.map(renderCard)}
      </div>
    );
  }

  return (
    <div style={{ minHeight: 320 }}>
      <Slidezy
        items={{ mobile: 2, tablet: 2, lg: 3, desktop: 4 }}
        gap={16}
        speed={300}
        loop={true}
        nav={true}
        controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
        slideBy={1}
        draggable={true}
        autoplay={true}
        autoplayTimeout={7000}
        autoplayHoverPause={true}
      >
        {products.map(renderCard)}
      </Slidezy>
    </div>
  );
});
