"use client";
import { VoucherCard } from "../voucher.types";
import { getDateRangeStatus } from "@/lib/admin/status";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function getVoucherStatus(voucher: VoucherCard) {
  return getDateRangeStatus({
    isActive: voucher.isActive,
    startDate: voucher.startDate,
    endDate: voucher.endDate,
    exhausted: !!(voucher.maxUses && voucher.usesCount >= voucher.maxUses),
  });
}

export function VoucherStatusBadge({ voucher }: { voucher: VoucherCard }) {
  const status = getVoucherStatus(voucher);
  return <StatusBadge label={status.label} className={status.color} />;
}
