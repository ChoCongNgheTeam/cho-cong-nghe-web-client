"use client";

import { WithPermission } from "@/components/admin/WithPermission";
import AdminProductDetailPage from "@/(admin)/admin/products/[id]/page";

export default function StaffProductDetailPage() {
  return (
    <WithPermission permission="canViewProducts" redirect="/staff/403">
      <AdminProductDetailPage />
    </WithPermission>
  );
}
