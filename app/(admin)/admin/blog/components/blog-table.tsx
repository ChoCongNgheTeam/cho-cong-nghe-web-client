"use client";

import { EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import apiRequest from "@/lib/api";
import { AdminBlog, BlogPagination } from "../_lib/blog.api";

type BlogTableProps = {
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
  if (!blog.category) return "Chua phan loai";
  if (typeof blog.category === "string") return blog.category;
  return blog.category.name ?? "Chua phan loai";
}

function resolveAuthor(blog: AdminBlog) {
  return blog.author?.email ?? blog.author?.fullName ?? "-";
}

function buildPageHref(page: number, category?: string, search?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  return `/admin/blog?${params.toString()}`;
}

export default function BlogTable({
  blogs,
  pagination,
  currentCategory,
  currentSearch,
}: BlogTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const previousPage = Math.max(1, pagination.page - 1);
  const nextPage = Math.min(pagination.totalPages || 1, pagination.page + 1);
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  const handleDeleteBlog = async (blogId: string) => {
    const ok = window.confirm("Ban co chac chan muon xoa bai viet nay?");
    if (!ok) return;

    setDeletingId(blogId);
    try {
      await apiRequest.delete<{ success: boolean; message?: string }>(`/blogs/${blogId}`, {
        timeout: 15000,
      });
      toast.success("Da xoa bai viet");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the xoa bai viet";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral bg-neutral-light">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-primary">
          <thead className="bg-accent-light text-primary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Bai viet</th>
              <th className="px-4 py-3 text-left font-semibold">Danh muc</th>
              <th className="px-4 py-3 text-left font-semibold">Nguoi viet</th>
              <th className="px-4 py-3 text-left font-semibold">Ngay tao</th>
              <th className="px-4 py-3 text-left font-semibold">Luot xem</th>
              <th className="px-4 py-3 text-left font-semibold">Tieu de</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-primary-light">
                  Khong co bai viet nao.
                </td>
              </tr>
            ) : (
              blogs.map((blog, idx) => (
                <tr key={blog.id} className="border-t border-neutral hover:bg-neutral-light-active">
                  <td className="px-4 py-3 align-top">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </td>
                  <td className="max-w-56 px-4 py-3 align-top">{blog.title}</td>
                  <td className="px-4 py-3 align-top">{resolveCategory(blog)}</td>
                  <td className="px-4 py-3 align-top">{resolveAuthor(blog)}</td>
                  <td className="px-4 py-3 align-top">{formatDate(blog.createdAt)}</td>
                  <td className="px-4 py-3 align-top">{blog.viewCount ?? 0}</td>
                  <td className="max-w-72 wrap-break-word px-4 py-3 align-top">{blog.slug}</td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="rounded-md p-2 text-primary-light hover:bg-neutral-light-active hover:text-primary"
                        aria-label="An bai viet"
                        type="button"
                      >
                        <EyeOff size={16} />
                      </button>
                      <Link
                        href={`/admin/blog/${blog.id}`}
                        className="rounded-md p-2 text-primary-light hover:bg-neutral-light-active hover:text-primary"
                        aria-label="Sua bai viet"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        className="rounded-md p-2 text-promotion hover:bg-promotion-light"
                        aria-label="Xoa bai viet"
                        type="button"
                        onClick={() => {
                          void handleDeleteBlog(blog.id);
                        }}
                        disabled={deletingId === blog.id || isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-neutral p-4">
        {canGoPrevious ? (
          <Link
            href={buildPageHref(previousPage, currentCategory, currentSearch)}
            className="rounded-lg border border-neutral px-4 py-2 text-sm font-medium text-primary hover:bg-neutral-light-active"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-neutral px-4 py-2 text-sm font-medium text-primary-light">
            Previous
          </span>
        )}
        <div className="flex items-center gap-2 text-sm">
          <button type="button" className="rounded-md bg-accent-light px-3 py-1.5 text-primary">
            {pagination.page}
          </button>
          <span className="text-primary-light">/ {pagination.totalPages} - Tong {pagination.total} bai viet</span>
        </div>
        {canGoNext ? (
          <Link
            href={buildPageHref(nextPage, currentCategory, currentSearch)}
            className="rounded-lg border border-neutral px-4 py-2 text-sm font-medium text-primary hover:bg-neutral-light-active"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-neutral px-4 py-2 text-sm font-medium text-primary-light">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
