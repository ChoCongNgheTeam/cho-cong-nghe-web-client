"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Clock, CheckCircle, Search, SlidersHorizontal, ChevronDown, ChevronUp, Trash2, CheckCheck, X, Loader2 } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import { getAllComments, approveComment, bulkApproveComments, deleteComment } from "./_libs/comments";
import { getCommentColumns } from "./components/TableComments";
import { CommentDetailDrawer } from "./components/CommentDetailDrawer";
import { Comment, CommentsResponse, GetCommentsParams } from "./comment.types";
import { APPROVAL_TABS, TARGET_TYPE_LABELS } from "./const";
import { StatsCard } from "@/components/admin/StatsCard";

const PAGE_SIZE = 20;

export default function CommentsAdminPage() {
  const [data, setData] = useState<CommentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [activeTab, setActiveTab] = useState("ALL");
  const [targetType, setTargetType] = useState<string>("");
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
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetCommentsParams = {
        page,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder,
      };
      if (activeTab !== "ALL") params.isApproved = activeTab === "true";
      if (targetType) params.targetType = targetType as any;
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await getAllComments(params);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, targetType, search, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [activeTab, targetType, search, dateFrom, dateTo, sortOrder]);

  // Search debounce
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(val), 400);
  };

  // ─── Stats ───────────────────────────────────────────────────────────────
  const total = data?.pagination.total ?? 0;
  const approved = data?.data.filter((c) => c.isApproved).length ?? 0;
  const pending = data?.data.filter((c) => !c.isApproved).length ?? 0;

  // ─── Selection ───────────────────────────────────────────────────────────
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.data.map((c) => c.id)));
    }
  };

  // ─── Actions ─────────────────────────────────────────────────────────────
  const handleApproveOne = async (comment: Comment, isApproved: boolean) => {
    await approveComment(comment.id, isApproved);
    fetchComments();
  };

  const handleApprovalChange = (id: string, isApproved: boolean) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, data: prev.data.map((c) => (c.id === id ? { ...c, isApproved } : c)) };
    });
  };

  const handleBulkApprove = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await bulkApproveComments(Array.from(selected), true);
      setSelected(new Set());
      fetchComments();
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteComment(deleteTarget.id);
      setDeleteTarget(null);
      fetchComments();
    } finally {
      setDeleting(false);
    }
  };

  // ─── Table columns ────────────────────────────────────────────────────────
  const columns = getCommentColumns({
    page,
    pageSize: PAGE_SIZE,
    selected,
    toggleOne,
    onViewClick: (id) => setOpenDrawerId(id),
    onApproveClick: handleApproveOne,
    onDeleteClick: (comment) => setDeleteTarget(comment),
  });

  const allSelected = !!data && data.data.length > 0 && selected.size === data.data.length;

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
            <p className="text-[12px] text-neutral-dark">Duyệt và quản lý bình luận của người dùng</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4 pb-8">
        {/* Stats */}
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
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.value ? "border-accent text-accent" : "border-transparent text-neutral-dark hover:text-primary"
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
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Tìm nội dung..."
              className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-neutral rounded-xl outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Target type filter */}
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="px-3 py-2 text-[13px] bg-white border border-neutral rounded-xl outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">Tất cả loại</option>
            {Object.entries(TARGET_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] transition-colors cursor-pointer ${
              showFilters || dateFrom || dateTo ? "border-accent text-accent bg-accent/5" : "border-neutral text-neutral-dark hover:border-accent hover:text-accent"
            }`}
          >
            <SlidersHorizontal size={13} />
            Lọc nâng cao
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Sort */}
          <button
            onClick={() => setSortOrder((v) => (v === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral text-[13px] text-neutral-dark hover:border-accent hover:text-accent transition-colors cursor-pointer"
          >
            {sortOrder === "desc" ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap bg-white border border-neutral rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-neutral-dark font-medium whitespace-nowrap">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1.5 text-[13px] border border-neutral rounded-lg outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-neutral-dark font-medium whitespace-nowrap">Đến ngày</label>
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
                className="flex items-center gap-1 text-[12px] text-neutral-dark hover:text-accent transition-colors cursor-pointer"
              >
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
              <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-[12px] text-neutral-dark hover:text-accent transition-colors cursor-pointer">
                <X size={12} /> Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral rounded-xl overflow-hidden">
          {/* Select all row */}
          {data && data.data.length > 0 && (
            <div className="px-4 py-2.5 border-b border-neutral flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
              <span className="text-[12px] text-neutral-dark">{allSelected ? "Bỏ chọn tất cả" : `Chọn tất cả ${data.data.length} bình luận trên trang`}</span>
            </div>
          )}

          <AdminTable columns={columns} data={data?.data ?? []} loading={loading} emptyMessage="Không có bình luận nào" onRowClick={(comment) => setOpenDrawerId(comment.id)} />
        </div>

        {/* Pagination */}
        {data && data.pagination.total > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-neutral-dark">
              Trang {data.pagination.page} / {data.pagination.totalPages} · {data.pagination.total} bình luận
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-[13px] border border-neutral rounded-lg text-neutral-dark hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-[13px] rounded-lg border transition-colors cursor-pointer ${
                      page === pg ? "border-accent bg-accent text-white" : "border-neutral text-neutral-dark hover:border-accent hover:text-accent"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-[13px] border border-neutral rounded-lg text-neutral-dark hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <CommentDetailDrawer commentId={openDrawerId} onClose={() => setOpenDrawerId(null)} onApprovalChange={handleApprovalChange} />

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
                <p className="text-[12px] text-neutral-dark">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-[13px] text-neutral-dark bg-neutral-light rounded-xl px-3 py-2.5 line-clamp-3">"{deleteTarget.content}"</p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[13px] border border-neutral rounded-lg text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer"
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
