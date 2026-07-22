"use client";
import { Review } from "../review.types";
import { REVIEW_STATUS_CONFIG } from "../_lib/constants";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function ReviewStatusBadge({ review }: { review: Review }) {
  const config = REVIEW_STATUS_CONFIG[review.isApproved];
  if (!config) return null;
  return <StatusBadge label={config.label} className={config.color} />;
}
