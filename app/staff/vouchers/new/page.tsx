"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminVouchersNewPage from "@/(admin)/admin/vouchers/new/page";

export default function StaffVouchersNewPage() {
  return (
    <WithPermission permission="canVouchers" redirect="/staff/vouchers">
      <AdminVouchersNewPage />
    </WithPermission>
  );
}
