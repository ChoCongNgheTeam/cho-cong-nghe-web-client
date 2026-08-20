"use client";

import dynamic from "next/dynamic";
import { FlashSaleSkeletonGrid } from "./FlashSaleProductGrid";
import type { SaleScheduleData } from "@/(client)/home/_lib/types";

// Tắt SSR cho section Flash Sale để né hoàn toàn lớp lỗi hydration mismatch
// (server render 1 tập sản phẩm, client hydrate ra tập khác — xem log Playwright
// smoke test). Nguyên nhân gốc nhiều khả năng nằm ở BE (query lấy sản phẩm sale
// không có ORDER BY ổn định, xem ghi chú trong CODE_REVIEW.md), nhưng dù BE có
// sửa hay không, việc render Client Component nặng-động-theo-thời-gian này hoàn
// toàn ở client vẫn là lựa chọn hợp lý: nội dung khuyến mãi đổi liên tục theo
// giờ/ngày nên gần như không có giá trị SEO khi index qua SSR, nên đánh đổi mất
// 1 chút First Contentful Paint (hiện skeleton trước) để đổi lấy loại bỏ HOÀN
// TOÀN rủi ro hydration mismatch là hợp lý.
const HotSaleOnlineClient = dynamic(() => import("./HotSaleOnline").then((m) => m.HotSaleOnline), {
  ssr: false,
  loading: () => (
    <section className="py-1 md:py-3 mt-10">
      <div className="container">
        <FlashSaleSkeletonGrid />
      </div>
    </section>
  ),
});

export function HotSaleOnlineLazy({ saleSchedule }: { saleSchedule: SaleScheduleData }) {
  return <HotSaleOnlineClient saleSchedule={saleSchedule} />;
}
