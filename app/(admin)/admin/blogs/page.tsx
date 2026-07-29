"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, BookOpen, Loader2, XCircle, Filter, ChevronDown, ChevronUp, X, Trash2, Eye, FileText, Archive } from "lucide-react";
import Link from "next/link";
import AdminTable from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/AdminPagination";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import type { BlogCard, BlogAuthor, BlogPagination, GetBlogsParams, BlogStatus } from "./blog.types";
import { getAllBlogs, deleteBlog, bulkDeleteBlogs, bulkUpdateBlogStatus, getBlogAuthors } from "./_lib/blogs";
import { BLOG_STATUS_TABS, SORT_OPTIONS } from "./_lib/constants";
import { getBlogColumns } from "./components/TableBlogs";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatNumber } from "@/helpers";
import { useAdminPrefix } from "@/contexts/AdminPrefixContext";
import { useAdminListPage, type AdminListFetchResult } from "@/hooks/admin/useAdminListPage";

type ActiveTab = "ALL" | BlogStatus;
type SortBy = "publishedAt" | "createdAt" | "updatedAt" | "viewCount" | "title";

interface BlogExtraParams {
  status?: BlogStatus;
  authorId?: string;
}

/**
 * BE hiện trả `pagination` thay vì `meta` cho module này (không đồng nhất với
 * các module khác) — adapter này chỉ ánh xạ lại tên field để dùng chung được
 * `useAdminListPage`. Khi BE đồng bộ tên field, xoá adapter này và gọi thẳng
 * `getAllBlogs`.
 */
async function fetchBlogsAdapted(params: GetBlogsParams & { page: number; limit: number; sortBy: SortBy; sortOrder: "asc" | "desc" }): Promise<AdminListFetchResult<BlogCard, BlogPagination>> {
  const res = await getAllBlogs(params);
  return { data: res.data, meta: res.pagination };
}

export default function BlogsPage() {
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);

  // Filter đặc thù module
  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("");

  const extraParams = useMemo<BlogExtraParams>(
    () => ({
      status: activeTab !== "ALL" ? activeTab : undefined,
      authorId: authorFilter || undefined,
    }),
    [activeTab, authorFilter],
  );

  const {
    data: allBlogs,
    setData: setAllBlogs,
    meta,
    loading,
    error,
    refetch: fetchBlogs,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    search,
    setSearch,
    searchInput,
    setSearchInput,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selected,
    setSelected,
    toggleOne,
    toggleAll,
  } = useAdminListPage<BlogCard, SortBy, BlogExtraParams, BlogPagination>({
    fetchFn: fetchBlogsAdapted,
    defaultSortBy: "publishedAt",
    defaultSortOrder: "desc",
    defaultPageSize: 12,
    defaultMeta: { page: 1, limit: 12, total: 0, totalPages: 1 },
    extraParams,
    getId: (b) => b.id,
  });

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BlogCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const prefix = useAdminPrefix();

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await getBlogAuthors();
      setAuthors(res.data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Stats (approximate từ server total + page data)
  const stats = useMemo(
    () => ({
      total: meta.total,
      published: allBlogs.filter((b) => b.status === "PUBLISHED").length,
      draft: allBlogs.filter((b) => b.status === "DRAFT").length,
      archived: allBlogs.filter((b) => b.status === "ARCHIVED").length,
      views: allBlogs.reduce((sum, b) => sum + b.viewCount, 0),
    }),
    [allBlogs, meta.total],
  );

  const hasActiveFilters = search || activeTab !== "ALL" || authorFilter;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setAuthorFilter("");
    resetPage();
  }, [resetPage, setSearch, setSearchInput]);

  const handleChangeStatus = useCallback(
    async (blog: BlogCard, status: string) => {
      try {
        await bulkUpdateBlogStatus([blog.id], status);
        setAllBlogs((prev) => prev.map((b) => (b.id === blog.id ? { ...b, status: status as BlogStatus } : b)));
      } catch (e: unknown) {
        alert((e as Error)?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [setAllBlogs],
  );

  const handleBulkStatus = useCallback(
    async (status: string) => {
      if (!selected.size) return;
      try {
        await bulkUpdateBlogStatus([...selected], status);
        setAllBlogs((prev) => prev.map((b) => (selected.has(b.id) ? { ...b, status: status as BlogStatus } : b)));
        setSelected(new Set());
      } catch (e: unknown) {
        alert((e as Error)?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [selected, setAllBlogs, setSelected],
  );

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
    } catch (e: unknown) {
      setDeleteError((e as Error)?.message ?? "Không thể xoá bài viết");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, setAllBlogs, setSelected]);

  const handleBulkDelete = useCallback(async () => {
    if (!selected.size) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteBlogs([...selected]);
      setAllBlogs((prev) => prev.filter((b) => !selected.has(b.id)));
      setSelected(new Set());
    } catch (e: unknown) {
      alert((e as Error)?.message ?? "Không thể xoá bài viết");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected, setAllBlogs, setSelected]);

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
        prefix,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleChangeStatus, prefix],
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
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
          <Link href={`${prefix}/blogs/new`} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl">
            <Plus size={15} /> Viết bài mới
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Tổng bài viết" value={stats.total} sub="Tất cả bài viết" icon={<BookOpen size={16} />} />
        <StatsCard label="Đã đăng" value={stats.published} sub="Đang hiển thị" icon={<Eye size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
        <StatsCard label="Nháp" value={stats.draft} sub="Chưa công khai" icon={<FileText size={16} />} valueClassName="text-blue-600" iconClassName="text-blue-600" />
        <StatsCard label="Lưu trữ" value={stats.archived} sub="Không còn sử dụng" icon={<Archive size={16} />} valueClassName="text-gray-500" iconClassName="text-gray-500" />
        <StatsCard label="Tổng lượt xem" value={formatNumber(stats.views)} sub="Tổng số lượt truy cập" icon={<Eye size={16} />} valueClassName="text-purple-600" iconClassName="text-purple-600" />
      </div>

      {/* Main card */}
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
                  resetPage();
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
                    resetPage();
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
                    resetPage();
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
                resetPage();
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
            <span className="ml-auto text-[12px] text-primary">{meta.total} bài viết</span>
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
                    resetPage();
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
                    setSortBy(e.target.value as SortBy);
                    resetPage();
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
                    resetPage();
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

        {/* Pagination — trước đây bị comment-out, không có cách xem trang 2 trở đi. Bổ sung lại. */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
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
                {[12, 24, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-primary">/ {meta.total} bài viết</span>
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
              pageSizeOptions={[12, 24, 50]}
              siblingCount={1}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Xoá bài viết?"
        itemName={deleteTarget?.title}
        warningText="Bài viết sẽ được chuyển vào thùng rác."
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError}
        confirmLabel="Xoá bài viết"
      />
    </div>
  );
}
