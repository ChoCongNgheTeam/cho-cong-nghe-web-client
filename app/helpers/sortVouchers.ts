import { Voucher } from "@/hooks/useVoucher";

export const sortVouchers = (vouchers: Voucher[], cartTotal: number): Voucher[] => {
  const getGroup = (v: Voucher): number => {
    if (!v.isActive || v.isExpired) return 4; // hết hạn/inactive
    if (cartTotal < v.minOrderValue) return 3; // chưa đủ điều kiện
    if (!v.isAvailable) return 3; // hết lượt
    if (v.isPrivate) return 1; // private + dùng được → ưu tiên nhất
    return 2; // public + dùng được
  };

  return [...vouchers].sort((a, b) => {
    const ga = getGroup(a);
    const gb = getGroup(b);
    if (ga !== gb) return ga - gb;

    // Cùng nhóm → sort phụ
    // 1. discountValue DESC
    const discountDiff = b.discountValue - a.discountValue;
    if (discountDiff !== 0) return discountDiff;

    // 2. minOrderValue ASC
    const minDiff = a.minOrderValue - b.minOrderValue;
    if (minDiff !== 0) return minDiff;

    // 3. endDate ASC (sắp hết hạn trước)
    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (a.endDate) return -1;
    if (b.endDate) return 1;

    return 0;
  });
};
