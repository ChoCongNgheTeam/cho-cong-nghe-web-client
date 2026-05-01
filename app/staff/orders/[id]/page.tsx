"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminOrderDetailPage from "@/(admin)/admin/orders/[id]/page";

export default function StaffOrderDetailPage() {
  return (
    <WithPermission permission="canViewOrders" redirect="/staff/orders">
      <AdminOrderDetailPage />
    </WithPermission>
  );
}
