"use client";
import { BLOG_STATUS_LABELS, BLOG_STATUS_COLORS } from "../_lib/constants";
import type { BlogStatus } from "../blog.types";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function BlogStatusBadge({ status }: { status: BlogStatus }) {
  return <StatusBadge label={BLOG_STATUS_LABELS[status] ?? status} className={BLOG_STATUS_COLORS[status] ?? "text-neutral-dark bg-neutral-light-active"} />;
}
