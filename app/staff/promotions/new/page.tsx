"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminPromotionsNewPage from "@/(admin)/admin/promotions/new/page";

export default function StaffPromotionsNewPage() {
  return (
    <WithPermission permission="canPromotions" redirect="/staff/promotions">
      <AdminPromotionsNewPage />
    </WithPermission>
  );
}
