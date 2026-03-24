interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build visible page numbers with ellipsis
  const getPages = (maxVisible: number): (number | "...")[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(2, currentPage - half + 1);
    let end = Math.min(totalPages - 1, start + maxVisible - 3);
    if (end - start < maxVisible - 3)
      start = Math.max(2, end - (maxVisible - 3) + 1);

    const pages: (number | "...")[] = [1];
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const btnBase =
    "flex items-center justify-center rounded-lg border border-neutral text-primary-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium";

  return (
    <div className="flex items-center justify-center gap-1 pt-3 sm:pt-4">
      {/* Prev */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} w-8 h-8 sm:w-9 sm:h-9 text-base`}
        aria-label="Trang trước"
      >
        ‹
      </button>

      {/* Mobile: fewer pages */}
      <div className="flex sm:hidden items-center gap-1">
        {getPages(3).map((page, i) =>
          page === "..." ? (
            <span
              key={`m-dot-${i}`}
              className="w-7 h-8 flex items-center justify-center text-xs text-neutral-darker"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`w-7 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${
                  currentPage === page
                    ? "bg-accent text-neutral-light shadow-sm border-transparent"
                    : "border border-neutral text-primary-dark hover:bg-neutral-light-active"
                }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Desktop: more pages */}
      <div className="hidden sm:flex items-center gap-1">
        {getPages(7).map((page, i) =>
          page === "..." ? (
            <span
              key={`d-dot-${i}`}
              className="w-9 h-9 flex items-center justify-center text-sm text-neutral-darker"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page as number)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${
                  currentPage === page
                    ? "bg-accent text-neutral-light shadow-sm border-transparent"
                    : "border border-neutral text-primary-dark hover:bg-neutral-light-active"
                }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} w-8 h-8 sm:w-9 sm:h-9 text-base`}
        aria-label="Trang sau"
      >
        ›
      </button>
    </div>
  );
}
