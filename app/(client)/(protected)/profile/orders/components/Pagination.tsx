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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm border border-neutral text-primary-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ‹
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${
              currentPage === page
                ? "bg-accent text-neutral-light shadow-sm"
                : "border border-neutral text-primary-dark hover:bg-neutral-light-active"
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm border border-neutral text-primary-dark hover:bg-neutral-light-active disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}
