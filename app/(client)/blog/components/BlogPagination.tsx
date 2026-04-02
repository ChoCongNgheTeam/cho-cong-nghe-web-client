"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = { currentPage: number; totalPages: number };

export default function BlogPagination({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    if (type) p.set("type", type);
    return `/blog?${p.toString()}`;
  };

  // Hiển thị tối đa 7 trang xung quanh currentPage
  const range: number[] = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    range.push(i);
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className="rounded-lg border border-neutral px-3 py-1.5 text-sm text-primary hover:bg-neutral-light-active transition-colors">
          ←
        </Link>
      )}

      {range[0] > 1 && (
        <>
          <Link href={buildHref(1)} className="rounded-lg border border-neutral px-3 py-1.5 text-sm text-primary hover:bg-neutral-light-active">
            1
          </Link>
          {range[0] > 2 && <span className="px-1 text-primary-light">…</span>}
        </>
      )}

      {range.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
            page === currentPage ? "border-accent bg-accent text-white" : "border-neutral text-primary hover:bg-neutral-light-active"
          }`}
        >
          {page}
        </Link>
      ))}

      {range[range.length - 1] < totalPages && (
        <>
          {range[range.length - 1] < totalPages - 1 && <span className="px-1 text-primary-light">…</span>}
          <Link href={buildHref(totalPages)} className="rounded-lg border border-neutral px-3 py-1.5 text-sm text-primary hover:bg-neutral-light-active">
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)} className="rounded-lg border border-neutral px-3 py-1.5 text-sm text-primary hover:bg-neutral-light-active transition-colors">
          →
        </Link>
      )}
    </div>
  );
}
