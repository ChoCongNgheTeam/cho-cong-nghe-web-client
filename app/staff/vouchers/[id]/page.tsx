"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminVoucherDetailPage from "@/(admin)/admin/vouchers/[id]/page";

export default function StaffVoucherDetailPage() {
  return (
    <WithPermission permission="canVouchers" redirect="/staff/vouchers">
      <AdminVoucherDetailPage />
    </WithPermission>
  );
}
