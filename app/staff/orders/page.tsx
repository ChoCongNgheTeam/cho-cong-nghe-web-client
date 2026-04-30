"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminOrdersPage from "@/(admin)/admin/orders/page";

export default function StaffOrdersPage() {
  return (
    <WithPermission permission="canViewOrders" redirect="/staff/403">
      <AdminOrdersPage />
    </WithPermission>
  );
}
