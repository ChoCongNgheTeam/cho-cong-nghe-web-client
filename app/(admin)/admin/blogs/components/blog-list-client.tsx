"use client";

import Image from "next/image";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import AdminTable, { AdminColumn } from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/PaginationAdmin";
import Popzy from "@/components/Modal/Popzy";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { resolveAdminBlogCategory } from "../_lib/blog-category";
import {
  AdminBlog,
  AdminBlogDetail,
  BlogPagination,
  getAdminBlogById,
  toggleBlogStatus,
} from "../_lib/blog.api";

type BlogListClientProps = {
  blogs: AdminBlog[];
  pagination: BlogPagination;
  currentCategory?: string;
  currentSearch?: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function resolveCategory(blog: AdminBlog) {
  return resolveAdminBlogCategory(blog).title;
}

function resolveAuthor(blog: AdminBlog) {
  return blog.author?.email ?? blog.author?.fullName ?? "-";
}

function buildPageHref(page: number, category?: string, search?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  return `/admin/blogs?${params.toString()}`;
}

export default function BlogListClient({
  blogs,
  pagination,
  currentCategory,
  currentSearch,
}: BlogListClientProps) {
  const router = useRouter();
  const toast = useToasty();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AdminBlog["status"]>>({});
  const [viewingBlog, setViewingBlog] = useState<AdminBlogDetail | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteBlog = async (blogId: string) => {
    setDeletingId(blogId);
    try {
      await apiRequest.delete<{ success: boolean; message?: string }>(`/blogs/admin/${blogId}`, {
        timeout: 15000,
      });
      toast.success("Đã xóa bài viết");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa bài viết";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleBlogStatus = async (blog: AdminBlog) => {
    const currentStatus = blog.status;
    const newStatus = currentStatus === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";

    // Optimistic UI update
    setStatusOverrides((prev) => ({ ...prev, [blog.id]: newStatus }));
    setTogglingId(blog.id);

    try {
      await toggleBlogStatus(blog.id, currentStatus);
      toast.success(newStatus === "ARCHIVED" ? "Đã ẩn bài viết" : "Đã hiển thị bài viết");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      // Revert state if request fails
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[blog.id];
        return next;
      });
      const message = error instanceof Error ? error.message : "Không thể thay đổi trạng thái bài viết";
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleViewBlog = async (blogId: string) => {
    setViewError(null);
    setViewLoading(true);
    setIsViewOpen(true);
    try {
      const data = await getAdminBlogById(blogId);
      setViewingBlog(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải chi tiết bài viết";
      setViewError(message);
    } finally {
      setViewLoading(false);
    }
  };

  const viewContent = viewLoading ? (
    <p className="text-sm text-primary-light">Đang tải chi tiết...</p>
  ) : viewError ? (
    <p className="text-sm text-promotion">{viewError}</p>
  ) : viewingBlog ? (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-primary">{viewingBlog.title}</h2>
          <p className="text-sm text-primary-light">
            {resolveCategory(viewingBlog)} • {formatDate(viewingBlog.createdAt)}
            {viewingBlog.publishedAt ? ` • ${formatDate(viewingBlog.publishedAt)}` : ""}
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-neutral-light-active px-3 py-1 text-xs font-semibold text-primary">
          {viewingBlog.status ?? "N/A"}
        </span>
      </div>

      {viewingBlog.excerpt && (
        <div>
          <h3 className="text-sm font-semibold text-primary">Tóm tắt</h3>
          <p className="text-sm text-primary-light">{viewingBlog.excerpt}</p>
        </div>
      )}

      {viewingBlog.thumbnail && (
        <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
          <Image
            src={viewingBlog.thumbnail}
            alt={viewingBlog.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-primary">Nội dung</h3>
        <div
          className="prose max-w-none text-sm text-primary"
          dangerouslySetInnerHTML={{ __html: viewingBlog.content ?? "" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-primary-light">Tác giả</p>
          <p className="text-sm text-primary">{resolveAuthor(viewingBlog)}</p>
        </div>
        <div>
          <p className="text-xs text-primary-light">Lượt xem</p>
          <p className="text-sm text-primary">{viewingBlog.viewCount ?? 0}</p>
        </div>
        {Array.isArray(viewingBlog.tags) && viewingBlog.tags.length > 0 && (
          <div className="col-span-1 sm:col-span-2">
            <p className="text-xs text-primary-light">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {viewingBlog.tags.map((tag) => {
                const label = typeof tag === "string" ? tag : tag.name ?? tag.slug ?? "";
                return (
                  <span
                    key={label}
                    className="rounded-full bg-neutral-light-active px-3 py-1 text-xs text-primary"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <p className="text-sm text-primary-light">Chưa có dữ liệu.</p>
  );

  const columns: AdminColumn<AdminBlog>[] = [
    {
      key: "_index",
      label: "STT",
      width: "w-16",
      render: (_, idx) => (pagination.page - 1) * pagination.limit + idx + 1,
    },
    {
      key: "title",
      label: "Bài viết",
      render: (blog) => <span className="line-clamp-2 block max-w-56">{blog.title}</span>,
    },
    {
      key: "_category",
      label: "Danh mục",
      render: (blog) => resolveCategory(blog),
    },
    {
      key: "_author",
      label: "Người viết",
      render: (blog) => resolveAuthor(blog),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (blog) => formatDate(blog.createdAt),
    },
    {
      key: "viewCount",
      label: "Lượt xem",
      render: (blog) => blog.viewCount ?? 0,
    },
    {
      key: "slug",
      label: "Slug",
      render: (blog) => <span className="wrap-break-word block max-w-72">{blog.slug}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (blog) => {
        const status = statusOverrides[blog.id] ?? blog.status;
        const isArchived = status === "ARCHIVED";
        return (
          <button
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition ${
              isArchived
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
            type="button"
            onClick={() => {
              void handleToggleBlogStatus(blog);
            }}
            disabled={togglingId === blog.id || isPending}
          >
            {isArchived ? <EyeOff size={14} /> : <Eye size={14} />}
            {isArchived ? "Đã ẩn" : "Đang hiển thị"}
          </button>
        );
      },
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (blog) => {
        const isViewingThis = viewingBlog?.id === blog.id;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-md p-2 text-primary-light hover:bg-neutral-light-active hover:text-primary"
              aria-label="Xem chi tiết bài viết"
              type="button"
              onClick={() => {
                void handleViewBlog(blog.id);
              }}
              disabled={viewLoading && isViewingThis}
            >
              <Eye size={16} />
            </button>

            <Link
              href={`/admin/blogs/${blog.id}`}
              className="rounded-md p-2 text-primary-light hover:bg-neutral-light-active hover:text-primary"
              aria-label="Sửa bài viết"
            >
              <Pencil size={16} />
            </Link>
            <button
              className="rounded-md p-2 text-promotion hover:bg-promotion-light"
              aria-label="Xóa bài viết"
              type="button"
              onClick={() => {
                void handleDeleteBlog(blog.id);
              }}
              disabled={deletingId === blog.id || isPending}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <AdminTable columns={columns} data={blogs} rowKey="id" emptyText="Không có bài viết nào." />
      <div className="px-1">
        <AdminPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages || 1}
          total={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(nextPage) => {
            router.push(buildPageHref(nextPage, currentCategory, currentSearch));
          }}
        />
      </div>

      <Popzy
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingBlog(null);
          setViewError(null);
        }}
        content={viewContent}
        cssClass="max-w-[900px]"
      />
    </div>
  );
}
