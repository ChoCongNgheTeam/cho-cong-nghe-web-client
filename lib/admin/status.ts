/**
 * getDateRangeStatus — logic dùng chung cho các entity có dạng
 * "còn hiệu lực theo khoảng ngày" (promotion, campaign, voucher...).
 * Trước đây 3 module này tự viết lại y hệt logic này
 * (getPromotionStatus, getCampaignStatus, getVoucherStatus).
 */

export type DateRangeStatusValue = "inactive" | "expired" | "upcoming" | "active" | "exhausted";

export interface DateRangeStatus {
  value: DateRangeStatusValue;
  label: string;
  color: string;
}

interface GetDateRangeStatusParams {
  isActive: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  /** Dùng khi cần parse theo timezone riêng, vd parseAPIDate. Mặc định new Date(). */
  parseDate?: (value: string) => Date | null;
  /** Nhãn hiển thị khi đã qua endDate. Mặc định "Hết hạn" (promotion/voucher dùng),
   * campaign dùng "Đã kết thúc". */
  expiredLabel?: string;
  /** true nếu entity đã dùng hết lượt (vd voucher hết maxUses) */
  exhausted?: boolean;
}

export function getDateRangeStatus({ isActive, startDate, endDate, parseDate, expiredLabel = "Hết hạn", exhausted = false }: GetDateRangeStatusParams): DateRangeStatus {
  const now = new Date();

  const parse = (d: string | Date | null | undefined): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    return parseDate ? parseDate(d) : new Date(d);
  };

  const start = parse(startDate);
  const end = parse(endDate);

  if (!isActive) {
    return { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" };
  }
  if (end && end < now) {
    return { value: "expired", label: expiredLabel, color: "text-neutral-dark bg-neutral-light-active" };
  }
  if (start && start > now) {
    return { value: "upcoming", label: "Sắp diễn ra", color: "text-blue-600 bg-blue-50" };
  }
  if (exhausted) {
    return { value: "exhausted", label: "Hết lượt", color: "text-neutral-dark bg-neutral-light-active" };
  }
  return { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" };
}
