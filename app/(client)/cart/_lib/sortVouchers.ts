import { Voucher } from "@/hooks/useVoucher";

export const sortVouchers = (vouchers: Voucher[], cartTotal: number): Voucher[] => {
  const getGroup = (v: Voucher): number => {
    if (!v.isActive || v.isExpired) return 4;
    if (cartTotal < v.minOrderValue) return 3;
    if (!v.isAvailable) return 3;
    if (v.isPrivate) return 1;
    return 2;
  };

  return [...vouchers].sort((a, b) => {
    const ga = getGroup(a);
    const gb = getGroup(b);
    if (ga !== gb) return ga - gb;

    const discountDiff = b.discountValue - a.discountValue;
    if (discountDiff !== 0) return discountDiff;

    const minDiff = a.minOrderValue - b.minOrderValue;
    if (minDiff !== 0) return minDiff;

    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (a.endDate) return -1;
    if (b.endDate) return 1;

    return 0;
  });
};
