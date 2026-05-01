"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminVoucherPrivateUsersPage from "@/(admin)/admin/vouchers/private-users/page";

export default function StaffVoucherPrivateUsersPage() {
  return (
    <WithPermission permission="canVouchers" redirect="/staff/vouchers">
      <AdminVoucherPrivateUsersPage />
    </WithPermission>
  );
}
