"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminReviewsPage from "@/(admin)/admin/reviews/page";

export default function StaffReviewsPage() {
  return (
    <WithPermission permission="canReviews" redirect="/staff/403">
      <AdminReviewsPage />
    </WithPermission>
  );
}
