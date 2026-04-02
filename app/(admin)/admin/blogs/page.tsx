"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, BookOpen, Loader2, XCircle, Filter, ChevronDown, ChevronUp, X, Trash2, Eye, FileText, Archive } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { BlogCard, BlogAuthor } from "./blog.types";
import { getAllBlogs, deleteBlog, bulkDeleteBlogs, bulkUpdateBlogStatus, getBlogAuthors } from "./_libs/blogs";
import { BLOG_STATUS_TABS, SORT_OPTIONS } from "./const";
import { getBlogColumns } from "./components/TableBlogs";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatNumber } from "@/helpers";

export default function BlogsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [allBlogs, setAllBlogs] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFromServer, setTotalFromServer] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<BlogCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllBlogs({
        page,
        limit: pageSize,
        search: search || undefined,
        status: activeTab !== "ALL" ? (activeTab as any) : undefined,
        authorId: authorFilter || undefined,
        sortBy: sortBy as any,
        sortOrder,
      });
      setAllBlogs(res.data);
      setTotalFromServer(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, activeTab, authorFilter, sortBy, sortOrder]);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await getBlogAuthors();
      setAuthors(res.data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // ── Stats (approximate từ server total + page data) ───────────────────────────
  const stats = useMemo(
    () => ({
      total: totalFromServer,
      published: allBlogs.filter((b) => b.status === "PUBLISHED").length,
      draft: allBlogs.filter((b) => b.status === "DRAFT").length,
      archived: allBlogs.filter((b) => b.status === "ARCHIVED").length,
      views: allBlogs.reduce((sum, b) => sum + b.viewCount, 0),
    }),
    [allBlogs, totalFromServer],
  );

  const hasActiveFilters = search || activeTab !== "ALL" || authorFilter;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setAuthorFilter("");
    setPage(1);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === allBlogs.length ? new Set() : new Set(allBlogs.map((b) => b.id))));
  }, [allBlogs]);

  // ── Change status ─────────────────────────────────────────────────────────────
  const handleChangeStatus = useCallback(async (blog: BlogCard, status: string) => {
    try {
      await bulkUpdateBlogStatus([blog.id], status);
      setAllBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, status: status as any } : b)));
    } catch (e: any) {
      alert(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, []);

  const handleBulkStatus = useCallback(
    async (status: string) => {
      if (!selected.size) return;
      try {
        await bulkUpdateBlogStatus([...selected], status);
        setAllBlogs((prev) => prev.map((b) => (selected.has(b.id) ? { ...b, status: status as any } : b)));
        setSelected(new Set());
      } catch (e: any) {
        alert(e?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [selected],
  );

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBlog(deleteTarget.id);
      setAllBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá bài viết");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleBulkDelete = useCallback(async () => {
    if (!selected.size) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteBlogs([...selected]);
      setAllBlogs((prev) => prev.filter((b) => !selected.has(b.id)));
      setSelected(new Set());
    } catch (e: any) {
      alert(e?.message ?? "Không thể xoá bài viết");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected]);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getBlogColumns({
        page,
        pageSize,
        selected,
        openStatusId,
        toggleOne,
        setOpenStatusId,
        onChangeStatus: handleChangeStatus,
        onDeleteClick: setDeleteTarget,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleChangeStatus],
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Bài viết</h1>
            <p className="text-[12px] text-primary">Quản lý blog và nội dung bài viết</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/blogs/new" className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl">
            <Plus size={15} /> Viết bài mới
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Tổng bài viết" value={stats.total} sub="Tất cả bài viết" icon={<BookOpen size={16} />} />

        <StatsCard label="Đã đăng" value={stats.published} sub="Đang hiển thị" icon={<Eye size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />

        <StatsCard label="Nháp" value={stats.draft} sub="Chưa công khai" icon={<FileText size={16} />} valueClassName="text-blue-600" iconClassName="text-blue-600" />

        <StatsCard label="Lưu trữ" value={stats.archived} sub="Không còn sử dụng" icon={<Archive size={16} />} valueClassName="text-gray-500" iconClassName="text-gray-500" />

        <StatsCard label="Tổng lượt xem" value={formatNumber(stats.views)} sub="Tổng số lượt truy cập" icon={<Eye size={16} />} valueClassName="text-purple-600" iconClassName="text-purple-600" />
      </div>

      {/* ── Main card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
        <div className="px-5 py-4 space-y-3 border-b border-neutral">
          {/* Row 1: Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {BLOG_STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${activeTab === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 2: Search + filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
                placeholder="Tìm tiêu đề, nội dung..."
                className="w-full pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
              className="px-3 py-2 bg-accent text-white text-[13px] font-medium rounded-xl hover:bg-accent/90 cursor-pointer"
            >
              Tìm
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-[13px] cursor-pointer ${showFilters || authorFilter ? "border-accent text-accent bg-accent/5" : "border-neutral text-primary hover:bg-neutral-light-active"}`}
            >
              <Filter size={14} /> Bộ lọc {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:text-primary hover:bg-neutral-light-active cursor-pointer"
              >
                <X size={13} /> Xoá lọc
              </button>
            )}
            <span className="ml-auto text-[12px] text-primary">{totalFromServer} bài viết</span>
          </div>

          {/* Row 3: Expanded filters */}
          {showFilters && (
            <div className="pt-2 border-t border-neutral grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-primary uppercase tracking-wider">Tác giả</label>
                <select
                  value={authorFilter}
                  onChange={(e) => {
                    setAuthorFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  <option value="">Tất cả tác giả</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName ?? a.email} ({a.blogCount} bài)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-primary uppercase tracking-wider">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-primary uppercase tracking-wider">Thứ tự</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc");
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  <option value="desc">Mới nhất trước</option>
                  <option value="asc">Cũ nhất trước</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20 flex-wrap">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} bài viết</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-primary hover:text-primary cursor-pointer">
              Bỏ chọn
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => handleBulkStatus("PUBLISHED")} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium rounded-lg cursor-pointer">
                Đăng tất cả
              </button>
              <button onClick={() => handleBulkStatus("DRAFT")} className="px-3 py-1.5 border border-neutral text-[12px] text-primary rounded-lg hover:bg-neutral-light-active cursor-pointer">
                Về nháp
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[12px] font-medium rounded-lg cursor-pointer"
              >
                {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Xoá {selected.size} bài
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchBlogs} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : allBlogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có bài viết nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <Link href="/admin/blogs/new" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
                Viết bài đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={allBlogs} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* Pagination */}
        {!loading && !error && allBlogs.length > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
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
                {[12, 24, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-primary">/ {totalFromServer} bài viết</span>
            </div>
            {/* <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} /> */}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <Popzy
          isOpen={!!deleteTarget}
          onClose={() => !deleting && setDeleteTarget(null)}
          footer={false}
          closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
          content={
            <div className="py-2">
              <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                <Trash2 size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá bài viết?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc muốn xoá</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-5 line-clamp-2">"{deleteTarget.title}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Bài viết sẽ được chuyển vào thùng rác.</p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  {deleting ? "Đang xoá..." : "Xoá bài viết"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
