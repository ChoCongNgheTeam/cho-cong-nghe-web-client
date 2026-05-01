"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminVoucherUsagesPage from "@/(admin)/admin/vouchers/usages/page";

export default function StaffVoucherUsagesPage() {
  return (
    <WithPermission permission="canVouchers" redirect="/staff/vouchers">
      <AdminVoucherUsagesPage />
    </WithPermission>
  );
}
