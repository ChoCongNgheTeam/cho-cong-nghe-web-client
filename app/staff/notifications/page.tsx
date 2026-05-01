"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import NotificationAdmin from "@/(admin)/admin/notifications/page";

export default function StaffNotifications() {
  return (
    <WithPermission permission="canNotifications" redirect="/staff/403">
      <NotificationAdmin />
    </WithPermission>
  );
}
