"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Clock, CheckCircle, SlidersHorizontal, ChevronDown, ChevronUp, CheckCheck, X, Loader2, XCircle } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { getAllComments, approveComment, bulkApproveComments, deleteComment, getComment } from "./_lib/comments";
import { getCommentColumns } from "./components/TableComments";
import { CommentDetailDrawer } from "./components/CommentDetailDrawer";
import { Comment, CommentsPagination, GetCommentsParams, CommentTargetType } from "./comment.types";
import { APPROVAL_TABS, TARGET_TYPE_LABELS } from "./_lib/constants";
import { StatsCard } from "@/components/admin/StatsCard";
import { ReplyCommentModal } from "./components/ReplyCommentModal";
import { useAdminListPage, type AdminListFetchResult } from "@/hooks/admin/useAdminListPage";

const PAGE_SIZE = 20;

type ApprovalTab = "ALL" | "true" | "false";

interface CommentExtraParams {
  isApproved?: boolean;
  targetType?: CommentTargetType;
  dateFrom?: string;
  dateTo?: string;
  parentId: null;
}

/**
 * BE hiện trả `pagination` thay vì `meta` cho module này (không đồng nhất với
 * các module khác) — adapter này chỉ ánh xạ lại tên field để dùng chung được
 * `useAdminListPage`. Khi BE đồng bộ tên field, xoá adapter này và gọi thẳng
 * `getAllComments`.
 */
async function fetchCommentsAdapted(params: GetCommentsParams & { page: number; limit: number; sortBy: "createdAt"; sortOrder: "asc" | "desc" }): Promise<AdminListFetchResult<Comment, CommentsPagination>> {
  const res = await getAllComments(params);
  return { data: res.data, meta: res.pagination };
}

export default function CommentsAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Highlight từ notification
  const highlightId = searchParams.get("commentId");
  const highlightRowRef = useRef<HTMLTableRowElement | null>(null);
  const hasHandledHighlight = useRef(false);

  // Filters đặc thù module
  const [activeTab, setActiveTab] = useState<ApprovalTab>("ALL");
  const [targetType, setTargetType] = useState<CommentTargetType | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const extraParams = useMemo<CommentExtraParams>(
    () => ({
      ...(activeTab !== "ALL" ? { isApproved: activeTab === "true" } : {}),
      ...(targetType ? { targetType } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      parentId: null,
    }),
    [activeTab, targetType, dateFrom, dateTo],
  );

  const {
    data: comments,
    setData: setComments,
    meta,
    loading,
    error,
    refetch: fetchComments,
    page,
    setPage,
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
  } = useAdminListPage<Comment, "createdAt", CommentExtraParams, CommentsPagination>({
    fetchFn: fetchCommentsAdapted,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultPageSize: PAGE_SIZE,
    defaultMeta: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
    extraParams,
    getId: (c) => c.id,
  });

  const [bulkLoading, setBulkLoading] = useState(false);

  // Drawer / Modal
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search debounce
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

    const jumpToComment = async () => {
      try {
        const res = await getComment(highlightId);
        if (!res?.data) return;

        hasHandledHighlight.current = true;

        // Scan từng page (sort desc, không filter) để tìm trang chứa comment
        let foundPage = 1;
        for (let p = 1; p <= 100; p++) {
          const scan = await getAllComments({
            page: p,
            limit: PAGE_SIZE,
            sortBy: "createdAt",
            sortOrder: "desc",
            parentId: null,
          });
          if (scan.data.some((c) => c.id === highlightId)) {
            foundPage = p;
            break;
          }
          if (p >= scan.pagination.totalPages) break;
        }

        // Reset toàn bộ filter về mặc định rồi jump đến đúng trang
        setActiveTab("ALL");
        setTargetType("");
        setSearch("");
        setSearchInput("");
        setDateFrom("");
        setDateTo("");
        setSortOrder("desc");
        setPage(foundPage);
      } catch (err) {
        console.error("[highlight] Không tìm thấy comment:", err);
      }
    };

    jumpToComment();
  }, [highlightId, setSearch, setSearchInput, setSortOrder, setPage]);

  // Sau khi data load xong → scroll + mở drawer
  useEffect(() => {
    if (!highlightId || loading) return;
    if (!comments.some((c) => c.id === highlightId)) return;

    requestAnimationFrame(() => {
      highlightRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    setOpenDrawerId(highlightId);

    // Xóa ?commentId khỏi URL sau 4s
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("commentId");
      const qs = params.toString();
      router.replace(`/admin/comments${qs ? `?${qs}` : ""}`);
    }, 4000);

    return () => clearTimeout(timer);
  }, [highlightId, loading, comments, searchParams, router]);

  // Stats — tính trên trang hiện tại (BE chưa trả tổng riêng approved/pending)
  const total = meta.total;
  const approved = comments.filter((c) => c.isApproved).length;
  const pending = comments.filter((c) => !c.isApproved).length;

  const handleApprovalChange = useCallback((id: string, isApproved: boolean) => setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isApproved } : c))), [setComments]);

  // Actions
  const handleApproveOne = useCallback(
    async (comment: Comment, isApproved: boolean) => {
      await approveComment(comment.id, isApproved);
      fetchComments();
    },
    [fetchComments],
  );

  const handleBulkApprove = useCallback(async () => {
    if (!selected.size) return;
    setBulkLoading(true);
    try {
      await bulkApproveComments(Array.from(selected), true);
      setSelected(new Set());
      fetchComments();
    } finally {
      setBulkLoading(false);
    }
  }, [selected, fetchComments, setSelected]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteComment(deleteTarget.id);
      setDeleteTarget(null);
      fetchComments();
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchComments]);

  const handleClearAdvancedFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
  }, []);

  // Table columns
  const columns = useMemo(
    () =>
      getCommentColumns({
        page,
        pageSize: PAGE_SIZE,
        selected,
        toggleOne,
        onViewClick: (id) => setOpenDrawerId(id),
        onApproveClick: handleApproveOne,
        onDeleteClick: (comment) => setDeleteTarget(comment),
        onReplyClick: (id) => setReplyTargetId(id),
      }),
    [page, selected, toggleOne, handleApproveOne],
  );

  const allSelected = comments.length > 0 && selected.size === comments.length;

  const rowClassName = useCallback((row: Comment) => (row.id === highlightId ? "ring-2 ring-inset ring-accent bg-accent/10 !hover:bg-accent/10" : ""), [highlightId]);

  // Gán id cho row để scroll bằng getElementById — thêm 1 cột ẩn width-0 render ref
  const columnsWithRef = useMemo(
    () => [
      {
        key: "_highlight_anchor",
        label: "",
        width: "w-0 p-0 overflow-hidden",
        render: (row: Comment) =>
          row.id === highlightId ? (
            <span
              id={`comment-row-${row.id}`}
              ref={(el) => {
                if (el) {
                  const tr = el.closest("tr");
                  if (tr) highlightRowRef.current = tr;
                }
              }}
            />
          ) : null,
      },
      ...columns,
    ],
    [columns, highlightId],
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Quản lý bình luận</h1>
            <p className="text-[12px] text-primary">Duyệt và quản lý bình luận của người dùng</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatsCard label="Tổng bình luận" value={total} sub="Tất cả bình luận" icon={<MessageSquare size={16} />} valueClassName="text-blue-600" iconClassName="text-blue-600" />
          <StatsCard label="Đã duyệt" value={approved} sub="Trên trang hiện tại" icon={<CheckCircle size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
          <StatsCard label="Chờ duyệt" value={pending} sub="Trên trang hiện tại" icon={<Clock size={16} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral">
          {APPROVAL_TABS.map((tab) => (
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
              placeholder="Tìm nội dung..."
              widthClassName="w-full"
            />
          </div>

          <select
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value as CommentTargetType | "");
              resetPage();
            }}
            className="px-3 py-2 text-[13px] border border-neutral rounded-xl outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">Tất cả loại</option>
            {Object.entries(TARGET_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

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
              <button onClick={handleClearAdvancedFilters} className="flex items-center gap-1 text-[12px] text-primary hover:text-accent transition-colors cursor-pointer">
                <X size={12} /> Xóa lọc
              </button>
            )}
          </div>
        )}

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/5 border border-accent/20 rounded-xl">
            <span className="text-[13px] text-accent font-medium">Đã chọn {selected.size} bình luận</span>
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
            <button onClick={fetchComments} className="ml-auto text-[12px] font-medium text-promotion hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl overflow-hidden">
          {comments.length > 0 && (
            <div className="px-4 py-2.5 flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
              <span className="text-[12px] text-primary">{allSelected ? "Bỏ chọn tất cả" : `Chọn tất cả ${comments.length} bình luận trên trang`}</span>
            </div>
          )}

          <AdminTable
            columns={columnsWithRef}
            data={comments}
            loading={loading}
            emptyText="Không có bình luận nào"
            onRowClick={(comment) => setOpenDrawerId(comment.id)}
            rowClassName={rowClassName}
            hoverAble={true}
          />
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-primary">
              Trang {meta.page} / {meta.totalPages} · {meta.total} bình luận
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-[13px] border border-neutral rounded-lg text-primary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Trước
              </button>

              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-[13px] rounded-lg border transition-colors cursor-pointer ${
                      page === pg ? "border-accent bg-accent text-white" : "border-neutral text-primary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-[13px] border border-neutral rounded-lg text-primary hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawers & Modals */}
      <CommentDetailDrawer commentId={openDrawerId} onClose={() => setOpenDrawerId(null)} onApprovalChange={handleApprovalChange} />

      <ReplyCommentModal commentId={replyTargetId} onClose={() => setReplyTargetId(null)} onReplied={fetchComments} />

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Xác nhận xóa"
          description=""
          warningText="Hành động này không thể hoàn tác"
          extra={<p className="text-[13px] text-primary bg-neutral-light rounded-xl px-3 py-2.5 line-clamp-3 text-left mb-4">&quot;{deleteTarget.content}&quot;</p>}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
          confirmLabel="Xóa"
        />
      )}
    </div>
  );
}
