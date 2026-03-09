"use client";

import { EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import AdminTable, { AdminColumn } from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { resolveAdminBlogCategory } from "../_lib/blog-category";
import { AdminBlog, BlogPagination } from "../_lib/blog.api";

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
  const [isPending, startTransition] = useTransition();

  const handleDeleteBlog = async (blogId: string) => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa bài viết này?");
    if (!ok) return;

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
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (blog) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-md p-2 text-primary-light hover:bg-neutral-light-active hover:text-primary"
            aria-label="Ẩn bài viết"
            type="button"
          >
            <EyeOff size={16} />
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
      ),
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
    </div>
  );
}
