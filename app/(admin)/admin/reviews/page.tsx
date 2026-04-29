"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, Clock, CheckCircle, XCircle, Search, SlidersHorizontal, ChevronDown, ChevronUp, Trash2, CheckCheck, X, Loader2 } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { getAllReviews, approveReview, deleteReview } from "./_libs/reviews";
import { getReviewColumns } from "./components/TableReviews";
import { ReviewDetailDrawer } from "./components/ReviewDetailDrawer";
import { Review, ReviewsResponse, GetReviewsParams, ReviewStatus } from "./review.types";
import { REVIEW_STATUS_TABS, RATING_OPTIONS } from "./const";
import { StatsCard } from "@/components/admin/StatsCard";

export default function ReviewsAdminPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [activeTab, setActiveTab] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Drawer
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // ─── Highlight từ notification ─────────────────────────────────────────
  const highlightId = searchParams.get("reviewId");
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
  const hasHandledHighlight = useRef(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetReviewsParams = {
        page,
        limit: pageSize,
        sortOrder,
      };
      if (activeTab !== "ALL") params.isApproved = activeTab as ReviewStatus;
      if (ratingFilter !== "") params.rating = ratingFilter as number;
      if (search) params.search = search;

      const res = await getAllReviews(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, ratingFilter, search, sortOrder]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [activeTab, ratingFilter, search, dateFrom, dateTo, sortOrder, pageSize]);

  // Search debounce
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 400);
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const total = data?.pagination.total ?? 0;
  const pending = data?.data.filter((r) => r.isApproved === "PENDING").length ?? 0;
  const approved = data?.data.filter((r) => r.isApproved === "APPROVED").length ?? 0;
  const rejected = data?.data.filter((r) => r.isApproved === "REJECTED").length ?? 0;
  const avgRating = data?.data.length ? (data.data.reduce((sum, r) => sum + r.rating, 0) / data.data.length).toFixed(1) : "—";

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.data.length) setSelected(new Set());
    else setSelected(new Set(data.data.map((r) => r.id)));
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const handleApproveOne = async (review: Review, status: ReviewStatus) => {
    await approveReview(review.id, status);
    fetchReviews();
  };

  const handleStatusChange = (id: string, status: ReviewStatus) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((r) => (r.id === id ? { ...r, isApproved: status } : r)),
      };
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      fetchReviews();
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = getReviewColumns({
    page,
    pageSize,
    selected,
    toggleOne,
    onViewClick: (id) => setOpenDrawerId(id),
    onApproveClick: handleApproveOne,
    onDeleteClick: (review) => setDeleteTarget(review),
  });


    useEffect(() => {
    if (!highlightId || hasHandledHighlight.current) return;

    const jumpToReview = async () => {
      try {
        // Scan từng page để tìm trang chứa review
        let foundPage = 1;
        for (let p = 1; p <= 100; p++) {
          const scan = await getAllReviews({
            page: p,
            limit: pageSize,
            sortOrder: "desc",
          });
          if (scan.data.some((r) => r.id === highlightId)) {
            foundPage = p;
            break;
          }
          if (p >= scan.pagination.totalPages) break;
        }

        hasHandledHighlight.current = true;

        // Reset filter về mặc định rồi jump đến đúng trang
        setActiveTab("ALL");
        setRatingFilter("");
        setSearch("");
        setSearchInput("");
        setDateFrom("");
        setDateTo("");
        setSortOrder("desc");
        setPage(foundPage);
      } catch (err) {
        console.error("[highlight] Không tìm thấy review:", err);
      }
    };

    jumpToReview();
  }, [highlightId]);

  // ─── Sau khi data load xong → scroll + mở drawer ──────────────────────
  useEffect(() => {
    if (!highlightId || loading || !data) return;
    if (!data.data.some((r) => r.id === highlightId)) return;

    requestAnimationFrame(() => {
      highlightRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    setOpenDrawerId(highlightId);

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("reviewId");
      const qs = params.toString();
      router.replace(`/admin/reviews${qs ? `?${qs}` : ""}`);
    }, 4000);

    return () => clearTimeout(timer);
  }, [highlightId, loading, data]);

  const allSelected = !!data && data.data.length > 0 && selected.size === data.data.length;

  const rowClassName = (row: Review) =>
  row.id === highlightId
    ? "ring-2 ring-inset ring-accent bg-accent/10"
    : "";

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-500">
            <Star size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Quản lý đánh giá</h1>
            <p className="text-[12px] text-primary">Duyệt và quản lý đánh giá sản phẩm</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatsCard label="Tổng đánh giá" value={total} sub="Tất cả đánh giá" icon={<Star size={16} />} valueClassName="text-amber-500" iconClassName="text-amber-500" />

          <StatsCard label="Chờ duyệt" value={pending} sub="Trên trang hiện tại" icon={<Clock size={16} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />

          <StatsCard label="Đã duyệt" value={approved} sub="Trên trang hiện tại" icon={<CheckCircle size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />

          <StatsCard label="Đánh giá TB" value={avgRating} sub="Điểm trung bình" icon={<Star size={16} />} valueClassName="text-amber-500" iconClassName="text-amber-500" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral">
          {REVIEW_STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.value ? "border-accent text-accent" : "border-transparent text-primary hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm nội dung nhận xét..."
              className="w-full pl-8 pr-3 py-2 text-[13px] border border-neutral rounded-xl outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-3 py-2 text-[13px] rounded-xl outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">Tất cả sao</option>
            {RATING_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {"⭐".repeat(r)} {r} sao
              </option>
            ))}
          </select>

          {/* Advanced filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] transition-colors cursor-pointer ${
              showFilters || dateFrom || dateTo ? "border-accent text-accent bg-accent/5" : "border-neutral text-primary hover:border-accent hover:text-accent"
            }`}
          >
            <SlidersHorizontal size={13} />
            Lọc nâng cao
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Sort */}
          <button
            onClick={() => setSortOrder((v) => (v === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral text-[13px] text-primary hover:border-accent hover:text-accent transition-colors cursor-pointer"
          >
            {sortOrder === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap bg-white border border-neutral rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-primary font-medium whitespace-nowrap">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1.5 text-[13px] border border-neutral rounded-lg outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-primary font-medium whitespace-nowrap">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1.5 text-[13px] border border-neutral rounded-lg outline-none focus:border-accent transition-colors"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="flex items-center gap-1 text-[12px] text-primary hover:text-accent transition-colors cursor-pointer"
              >
                <X size={12} /> Xóa lọc
              </button>
            )}
          </div>
        )}

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/5 border border-accent/20 rounded-xl">
            <span className="text-[13px] text-accent font-medium">Đã chọn {selected.size} đánh giá</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={async () => {
                  setBulkLoading(true);
                  try {
                    await Promise.all(Array.from(selected).map((id) => approveReview(id, "APPROVED")));
                    setSelected(new Set());
                    fetchReviews();
                  } finally {
                    setBulkLoading(false);
                  }
                }}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[12px] font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {bulkLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                Duyệt tất cả
              </button>
              <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-[12px] text-primary hover:text-accent transition-colors cursor-pointer">
                <X size={12} /> Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral rounded-xl overflow-hidden">
          {data && data.data.length > 0 && (
            <div className="px-4 py-2.5 border-b border-neutral flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
              <span className="text-[12px] text-primary">{allSelected ? "Bỏ chọn tất cả" : `Chọn tất cả ${data.data.length} đánh giá trên trang`}</span>
            </div>
          )}
          <AdminTable columns={columns} data={data?.data ?? []} loading={loading} emptyMessage="Không có đánh giá nào" onRowClick={(review) => setOpenDrawerId(review.id)} rowClassName={rowClassName} />

          {/* Pagination */}
          {!loading && data && data.pagination.total > 0 && (
            <div className="px-4 py-3 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-primary">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
                >
                  {[20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-[12px] text-primary">/ {data.pagination.total} đánh giá</span>
              </div>
              {/* <AdminPagination page={page} totalPages={data.pagination.totalPages} onPageChange={setPage} /> */}
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <ReviewDetailDrawer reviewId={openDrawerId} onClose={() => setOpenDrawerId(null)} onStatusChange={handleStatusChange} />

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-primary">Xác nhận xóa</h3>
                <p className="text-[12px] text-primary">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <div className="bg-neutral-light rounded-xl px-3 py-2.5 space-y-1">
              <p className="text-[12px] text-primary">
                {deleteTarget.user?.fullName ?? "Ẩn danh"} — {deleteTarget.orderItem?.productVariant?.product?.name ?? "—"}
              </p>
              {deleteTarget.comment && <p className="text-[12px] text-primary line-clamp-2">"{deleteTarget.comment}"</p>}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[13px] border border-neutral rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
