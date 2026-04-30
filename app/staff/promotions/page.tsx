"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminPromotionsPage from "@/(admin)/admin/promotions/page";

export default function StaffPromotionsPage() {
  return (
    <WithPermission permission="canPromotions" redirect="/staff/403">
      <AdminPromotionsPage />
    </WithPermission>
  );
}
