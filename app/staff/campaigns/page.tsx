"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminCampaignsPage from "@/(admin)/admin/campaigns/page";

export default function StaffCampaignsPage() {
  return (
    <WithPermission permission="canCampaigns" redirect="/staff/403">
      <AdminCampaignsPage />
    </WithPermission>
  );
}
