"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, Clock, CheckCircle, XCircle, SlidersHorizontal, ChevronDown, ChevronUp, CheckCheck, X, Loader2 } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/AdminPagination";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { getAllReviews, approveReview, deleteReview } from "./_lib/reviews";
import { getReviewColumns } from "./components/TableReviews";
import { ReviewDetailDrawer } from "./components/ReviewDetailDrawer";
import { Review, ReviewsPagination, GetReviewsParams, ReviewStatus } from "./review.types";
import { REVIEW_STATUS_TABS, RATING_OPTIONS } from "./_lib/constants";
import { StatsCard } from "@/components/admin/StatsCard";
import { useAdminListPage, type AdminListFetchResult } from "@/hooks/admin/useAdminListPage";

type ApprovalTab = "ALL" | ReviewStatus;

interface ReviewExtraParams {
  isApproved?: ReviewStatus;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * BE hiện trả `pagination` thay vì `meta` cho module này (không đồng nhất với
 * các module khác) — adapter này chỉ ánh xạ lại tên field để dùng chung được
 * `useAdminListPage`. Khi BE đồng bộ tên field, xoá adapter này và gọi thẳng
 * `getAllReviews`.
 */
async function fetchReviewsAdapted(
  params: GetReviewsParams & { page: number; limit: number; sortBy: "createdAt"; sortOrder: "asc" | "desc" },
): Promise<AdminListFetchResult<Review, ReviewsPagination>> {
  const res = await getAllReviews(params);
  return { data: res.data, meta: res.pagination };
}

export default function ReviewsAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Highlight từ notification
  const highlightId = searchParams.get("reviewId");
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
  const hasHandledHighlight = useRef(false);

  // Filters đặc thù module
  const [activeTab, setActiveTab] = useState<ApprovalTab>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const extraParams = useMemo<ReviewExtraParams>(
    () => ({
      ...(activeTab !== "ALL" ? { isApproved: activeTab } : {}),
      ...(ratingFilter !== "" ? { rating: ratingFilter } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [activeTab, ratingFilter, dateFrom, dateTo],
  );

  const {
    data: reviews,
    setData: setReviews,
    meta,
    loading,
    error,
    refetch: fetchReviews,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    search,
    setSearch,
    searchInput,
    setSearchInput,
    sortOrder,
    setSortOrder,
    selected,
    setSelected,
    toggleOne,
    toggleAll,
  } = useAdminListPage<Review, "createdAt", ReviewExtraParams, ReviewsPagination>({
    fetchFn: fetchReviewsAdapted,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (r) => r.id,
  });

  const [bulkLoading, setBulkLoading] = useState(false);
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchInput = useCallback(
    (val: string) => {
      setSearchInput(val);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => setSearch(val), 400);
    },
    [setSearch, setSearchInput],
  );

  // Highlight: tìm đúng trang rồi jump
  useEffect(() => {
    if (!highlightId || hasHandledHighlight.current) return;

    const jumpToReview = async () => {
      try {
        let foundPage = 1;
        for (let p = 1; p <= 100; p++) {
          const scan = await getAllReviews({ page: p, limit: pageSize, sortOrder: "desc" });
          if (scan.data.some((r) => r.id === highlightId)) {
            foundPage = p;
            break;
          }
          if (p >= scan.pagination.totalPages) break;
        }

        hasHandledHighlight.current = true;

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
  }, [highlightId, pageSize, setSearch, setSearchInput, setSortOrder, setPage]);

  // Sau khi data load xong → scroll + mở drawer
  useEffect(() => {
    if (!highlightId || loading) return;
    if (!reviews.some((r) => r.id === highlightId)) return;

    requestAnimationFrame(() => {
      highlightRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    setOpenDrawerId(highlightId);

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("reviewId");
      const qs = params.toString();
      router.replace(`/admin/reviews${qs ? `?${qs}` : ""}`);
    }, 4000);

    return () => clearTimeout(timer);
  }, [highlightId, loading, reviews, searchParams, router]);

  // Stats — tính trên trang hiện tại (BE chưa trả tổng riêng theo status)
  const total = meta.total;
  const pending = reviews.filter((r) => r.isApproved === "PENDING").length;
  const approved = reviews.filter((r) => r.isApproved === "APPROVED").length;
  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const handleApproveOne = useCallback(
    async (review: Review, status: ReviewStatus) => {
      await approveReview(review.id, status);
      fetchReviews();
    },
    [fetchReviews],
  );

  const handleStatusChange = useCallback((id: string, status: ReviewStatus) => setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: status } : r))), [setReviews]);

  const handleBulkApprove = useCallback(async () => {
    setBulkLoading(true);
    try {
      await Promise.all(Array.from(selected).map((id) => approveReview(id, "APPROVED")));
      setSelected(new Set());
      fetchReviews();
    } finally {
      setBulkLoading(false);
    }
  }, [selected, fetchReviews, setSelected]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      fetchReviews();
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchReviews]);

  const columns = useMemo(
    () =>
      getReviewColumns({
        page,
        pageSize,
        selected,
        toggleOne,
        onViewClick: (id) => setOpenDrawerId(id),
        onApproveClick: handleApproveOne,
        onDeleteClick: (review) => setDeleteTarget(review),
      }),
    [page, pageSize, selected, toggleOne, handleApproveOne],
  );

  const allSelected = reviews.length > 0 && selected.size === reviews.length;
  const rowClassName = useCallback((row: Review) => (row.id === highlightId ? "ring-2 ring-inset ring-accent bg-accent/10" : ""), [highlightId]);

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
              onClick={() => {
                setActiveTab(tab.value);
                resetPage();
              }}
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
          <div className="flex-1 min-w-[200px] max-w-xs">
            <SearchBox
              value={searchInput}
              onChange={handleSearchInput}
              onSubmit={(v) => {
                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                setSearch(v);
                resetPage();
              }}
              onClear={() => {
                handleSearchInput("");
                resetPage();
              }}
              placeholder="Tìm nội dung nhận xét..."
              widthClassName="w-full"
            />
          </div>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value === "" ? "" : Number(e.target.value));
              resetPage();
            }}
            className="px-3 py-2 text-[13px] border border-neutral rounded-xl outline-none focus:border-accent transition-colors cursor-pointer"
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
            onClick={() => {
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
              resetPage();
            }}
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
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  resetPage();
                }}
                className="px-2.5 py-1.5 text-[13px] border border-neutral rounded-lg outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-primary font-medium whitespace-nowrap">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  resetPage();
                }}
                className="px-2.5 py-1.5 text-[13px] border border-neutral rounded-lg outline-none focus:border-accent transition-colors"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  resetPage();
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
                onClick={handleBulkApprove}
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

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-promotion-light border border-promotion/30 rounded-xl">
            <XCircle size={16} className="text-promotion shrink-0" />
            <p className="text-[13px] text-promotion">{error}</p>
            <button onClick={fetchReviews} className="ml-auto text-[12px] font-medium text-promotion hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral rounded-xl overflow-hidden">
          {reviews.length > 0 && (
            <div className="px-4 py-2.5 border-b border-neutral flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
              <span className="text-[12px] text-primary">{allSelected ? "Bỏ chọn tất cả" : `Chọn tất cả ${reviews.length} đánh giá trên trang`}</span>
            </div>
          )}
          <AdminTable columns={columns} data={reviews} loading={loading} emptyMessage="Không có đánh giá nào" onRowClick={(review) => setOpenDrawerId(review.id)} rowClassName={rowClassName} />

          {/* Pagination — trước đây bị comment-out, không có cách xem trang 2 trở đi. Bổ sung lại. */}
          {!loading && meta.total > 0 && (
            <div className="px-4 py-3 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-primary">Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    resetPage();
                  }}
                  className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
                >
                  {[20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-[12px] text-primary">/ {meta.total} đánh giá</span>
              </div>
              <AdminPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  resetPage();
                }}
                pageSizeOptions={[20, 50, 100]}
                siblingCount={1}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <ReviewDetailDrawer reviewId={openDrawerId} onClose={() => setOpenDrawerId(null)} onStatusChange={handleStatusChange} />

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xác nhận xóa"
          description=""
          warningText="Hành động này không thể hoàn tác"
          extra={
            <div className="bg-neutral-light rounded-xl px-3 py-2.5 space-y-1 text-left mb-4">
              <p className="text-[12px] text-primary">
                {deleteTarget.user?.fullName ?? "Ẩn danh"} — {deleteTarget.orderItem?.productVariant?.product?.name ?? "—"}
              </p>
              {deleteTarget.comment && <p className="text-[12px] text-primary line-clamp-2">&quot;{deleteTarget.comment}&quot;</p>}
            </div>
          }
          onConfirm={handleDeleteConfirm}
          loading={deleting}
          confirmLabel="Xóa"
        />
      )}
    </div>
  );
}
