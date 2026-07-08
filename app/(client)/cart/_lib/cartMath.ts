/**
 * Trước đây công thức "tổng sau khi trừ voucher" bị lặp lại độc lập ở 3 nơi
 * (cart/page.tsx, CartSidebar.tsx, OrderSummary.tsx) — nếu logic đổi (thêm cap,
 * thêm loại giảm giá khác...) rất dễ quên sửa hết. Gộp về đây làm nguồn duy nhất.
 *
 * `baseAfterDiscount` là tổng đã trừ khuyến mãi sản phẩm (chưa trừ voucher) —
 * ở trang cart là `finalTotal` (đã bao gồm giảm giá promotion), ở trang
 * checkout là `subtotal - totalPromotionDiscount` (trước khi cộng phí ship).
 */
export function computeFinalTotalWithVoucher(baseAfterDiscount: number, voucherValue: number): number {
  return Math.max(0, baseAfterDiscount - voucherValue);
}
