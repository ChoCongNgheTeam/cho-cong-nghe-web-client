"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminMediaPage from "@/(admin)/admin/media/page";

export default function StaffMediaPage() {
  return (
    <WithPermission permission="canMedia" redirect="/staff/403">
      <AdminMediaPage />
    </WithPermission>
  );
}
