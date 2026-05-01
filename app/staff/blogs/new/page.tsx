"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminBlogsNewPage from "@/(admin)/admin/blogs/new/page";

export default function StaffBlogsNewPage() {
  return (
    <WithPermission permission="canBlogs" redirect="/staff/blogs">
      <AdminBlogsNewPage />
    </WithPermission>
  );
}
