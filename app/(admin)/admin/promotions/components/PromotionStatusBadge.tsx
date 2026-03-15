"use client";
import { Promotion } from "../promotion.types";

export function getPromotionStatus(promotion: Promotion): {
  label: string;
  color: string;
  value: string;
} {
  const now = new Date();
  const start = promotion.startDate ? new Date(promotion.startDate) : null;
  const end = promotion.endDate ? new Date(promotion.endDate) : null;

  if (!promotion.isActive) {
    return { value: "inactive", label: "Tạm dừng", color: "text-orange-500 bg-orange-50" };
  }
  if (end && end < now) {
    return { value: "expired", label: "Hết hạn", color: "text-neutral-dark bg-neutral-light-active" };
  }
  if (start && start > now) {
    return { value: "upcoming", label: "Sắp diễn ra", color: "text-blue-600 bg-blue-50" };
  }
  return { value: "active", label: "Đang hoạt động", color: "text-emerald-600 bg-emerald-50" };
}

export function PromotionStatusBadge({ promotion }: { promotion: Promotion }) {
  const status = getPromotionStatus(promotion);
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${status.color}`}>{status.label}</span>;
}
