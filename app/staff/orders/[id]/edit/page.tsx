"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminOrderEditPage from "@/(admin)/admin/orders/[id]/edit/page";

export default function StaffOrderEditPage() {
  return (
    <WithPermission permission="canUpdateOrder" redirect="/staff/orders">
      <AdminOrderEditPage />
    </WithPermission>
  );
}
