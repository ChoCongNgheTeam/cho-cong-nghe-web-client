"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminProductsPage from "@/(admin)/admin/products/page";

export default function StaffProductsPage() {
  return (
    <WithPermission permission="canViewProducts" redirect="/staff/403">
      <AdminProductsPage />
    </WithPermission>
  );
}
