"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminPromotionDetailPage from "@/(admin)/admin/promotions/[id]/page";

export default function StaffPromotionDetailPage() {
  return (
    <WithPermission permission="canPromotions" redirect="/staff/promotions">
      <AdminPromotionDetailPage />
    </WithPermission>
  );
}
