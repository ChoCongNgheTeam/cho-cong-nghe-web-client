"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminBlogDetailPage from "@/(admin)/admin/blogs/[id]/page";

export default function StaffBlogDetailPage() {
  return (
    <WithPermission permission="canBlogs" redirect="/staff/blogs">
      <AdminBlogDetailPage />
    </WithPermission>
  );
}
