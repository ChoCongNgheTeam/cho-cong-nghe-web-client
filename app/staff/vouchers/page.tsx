"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminVouchersPage from "@/(admin)/admin/vouchers/page";

export default function StaffVouchersPage() {
  return (
    <WithPermission permission="canVouchers" redirect="/staff/403">
      <AdminVouchersPage />
    </WithPermission>
  );
}
