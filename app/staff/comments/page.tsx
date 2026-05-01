"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminCommentsPage from "@/(admin)/admin/comments/page";

export default function StaffCommentsPage() {
  return (
    <WithPermission permission="canComments" redirect="/staff/403">
      <AdminCommentsPage />
    </WithPermission>
  );
}
