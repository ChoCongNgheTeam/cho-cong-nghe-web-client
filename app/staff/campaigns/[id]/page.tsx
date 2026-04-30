"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminCampaignDetailPage from "@/(admin)/admin/campaigns/[id]/page";

export default function StaffCampaignDetailPage() {
  return (
    <WithPermission permission="canCampaigns" redirect="/staff/campaigns">
      <AdminCampaignDetailPage />
    </WithPermission>
  );
}
