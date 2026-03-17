"use client";
import { Review } from "../review.types";
import { REVIEW_STATUS_CONFIG } from "../const";

export function ReviewStatusBadge({ review }: { review: Review }) {
  const config = REVIEW_STATUS_CONFIG[review.isApproved];
  if (!config) return null;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${config.color}`}>{config.label}</span>;
}
