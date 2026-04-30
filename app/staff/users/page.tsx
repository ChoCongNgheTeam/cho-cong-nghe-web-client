"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminUsersPage from "@/(admin)/admin/users/page";

export default function StaffUsersPage() {
  return (
    <WithPermission permission="canViewUsers" redirect="/staff/403">
      <AdminUsersPage />
    </WithPermission>
  );
}
