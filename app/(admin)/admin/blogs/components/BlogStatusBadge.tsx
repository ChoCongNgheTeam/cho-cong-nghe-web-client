"use client";
import { BLOG_STATUS_LABELS, BLOG_STATUS_COLORS } from "../const";
import type { BlogStatus } from "../blog.types";

export function BlogStatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${BLOG_STATUS_COLORS[status] ?? "text-neutral-dark bg-neutral-light-active"}`}>
      {BLOG_STATUS_LABELS[status] ?? status}
    </span>
  );
}
