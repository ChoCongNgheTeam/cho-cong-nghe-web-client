"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
};

export default function BlogPagination({
  currentPage,
  totalPages,
}: Props) {
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
      {/* Prev */}
      {currentPage > 1 && (
        <Link
          href={createPageLink(currentPage - 1)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
        >
          ←
        </Link>
      )}

      {/* Pages */}
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;

        return (
          <Link
            key={page}
            href={createPageLink(page)}
            className={`rounded-md border px-3 py-1 text-sm ${
              isActive
                ? "border-primary bg-primary text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < totalPages && (
        <Link
          href={createPageLink(currentPage + 1)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
        >
          →
        </Link>
      )}
    </div>
  );
}
