"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminBlogsPage from "@/(admin)/admin/blogs/page";

export default function StaffBlogsPage() {
  return (
    <WithPermission permission="canBlogs" redirect="/staff/403">
      <AdminBlogsPage />
    </WithPermission>
  );
}
