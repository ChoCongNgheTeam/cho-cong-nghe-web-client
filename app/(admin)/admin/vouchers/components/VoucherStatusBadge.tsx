"use client";
import { VoucherCard } from "../voucher.types";

export function getVoucherStatus(voucher: VoucherCard): {
  label: string;
  color: string;
  value: string;
} {
  const now = new Date();
  const start = voucher.startDate ? new Date(voucher.startDate) : null;
  const end = voucher.endDate ? new Date(voucher.endDate) : null;

  if (!voucher.isActive) {
    return { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" };
  }
  if (end && end < now) {
    return { value: "expired", label: "Hết hạn", color: "text-neutral-dark bg-neutral-light-active" };
  }
  if (start && start > now) {
    return { value: "upcoming", label: "Sắp diễn ra", color: "text-blue-600 bg-blue-50" };
  }
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    return { value: "exhausted", label: "Hết lượt", color: "text-neutral-dark bg-neutral-light-active" };
  }
  return { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" };
}

export function VoucherStatusBadge({ voucher }: { voucher: VoucherCard }) {
  const status = getVoucherStatus(voucher);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${status.color}`}>{status.label}</span>;
}
