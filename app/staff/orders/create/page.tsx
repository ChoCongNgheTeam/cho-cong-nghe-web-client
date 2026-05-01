"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminOrdersCreatePage from "@/(admin)/admin/orders/create/page";

export default function StaffOrdersCreatePage() {
  return (
    <WithPermission permission="canCreateOrder" redirect="/staff/orders">
      <AdminOrdersCreatePage />
    </WithPermission>
  );
}
