"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminAnalyticsPage from "@/(admin)/admin/analytics/page";

export default function StaffAnalyticsPage() {
  return (
    <WithPermission permission="canAnalytics" redirect="/staff/403">
      <AdminAnalyticsPage />
    </WithPermission>
  );
}
