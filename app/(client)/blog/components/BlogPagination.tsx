"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function BlogPagination({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  if (totalPages <= 1) return null;

  const createPageLink = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (category) params.set("category", category);
    return `/blog?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      {currentPage > 1 && (
        <Link
          href={createPageLink(currentPage - 1)}
          className="rounded-md border border-neutral px-3 py-1 text-sm text-primary hover:bg-neutral-light-active"
        >
          Prev
        </Link>
      )}

      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;

        return (
          <Link
            key={page}
            href={createPageLink(page)}
            className={`rounded-md border px-3 py-1 text-sm ${
              isActive
                ? "border-accent bg-accent text-neutral-light"
                : "border-neutral text-primary hover:bg-neutral-light-active"
            }`}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={createPageLink(currentPage + 1)}
          className="rounded-md border border-neutral px-3 py-1 text-sm text-primary hover:bg-neutral-light-active"
        >
          Next
        </Link>
      )}
    </div>
  );
}
