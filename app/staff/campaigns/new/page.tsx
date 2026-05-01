"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminCampaignsNewPage from "@/(admin)/admin/campaigns/new/page";

export default function StaffCampaignsNewPage() {
  return (
    <WithPermission permission="canCampaigns" redirect="/staff/campaigns">
      <AdminCampaignsNewPage />
    </WithPermission>
  );
}
