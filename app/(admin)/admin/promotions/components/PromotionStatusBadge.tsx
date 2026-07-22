"use client";
import { Promotion } from "../promotion.types";
import { parseAPIDate } from "@/helpers/timezoneHelpers";
import { getDateRangeStatus } from "@/lib/admin/status";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function getPromotionStatus(promotion: Promotion) {
  return getDateRangeStatus({
    isActive: promotion.isActive,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    parseDate: parseAPIDate,
  });
}

export function PromotionStatusBadge({ promotion }: { promotion: Promotion }) {
  const status = getPromotionStatus(promotion);
  return <StatusBadge label={status.label} className={status.color} />;
}
