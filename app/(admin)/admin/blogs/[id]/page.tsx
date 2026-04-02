"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Pencil, Loader2, XCircle, Trash2, Check, Eye, Clock, BarChart2, User, Calendar } from "lucide-react";
import { Popzy } from "@/components/Modal";
import { getBlog, updateBlog, deleteBlog } from "../_libs/blogs";
import { BlogForm, blogToForm } from "../components/BlogForm";
import { BlogStatusBadge } from "../components/BlogStatusBadge";
import { BLOG_STATUS_LABELS } from "../const";
import type { BlogDetail } from "../blog.types";
import { formatDate, formatNumber } from "@/helpers";

export default function BlogDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const params = useParams();
  const id = params.id as string;

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBlog(id);
      setBlog(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải bài viết");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleSave = async (formData: FormData) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await updateBlog(id, formData);
      setBlog(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      setSaveError(e?.message ?? "Không thể cập nhật bài viết");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBlog(id);
      router.push("/admin/blogs");
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá bài viết");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );

  if (error || !blog)
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center gap-3">
        <XCircle size={36} className="text-promotion opacity-50" />
        <p className="text-[13px] text-neutral-dark">{error ?? "Không tìm thấy bài viết"}</p>
        <Link href="/admin/blogs" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
          Quay lại
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3 flex-wrap">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/blogs" className="text-[13px] text-neutral-dark hover:text-accent">
          Bài viết
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium line-clamp-1 max-w-xs">{blog.title}</span>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-screen-xl">
        {/* ── Left sidebar: meta info ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info card */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/blogs/${blog.id}?edit=true`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
                  title="Chỉnh sửa"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
                  title="Xoá"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Thumbnail */}
            {blog.thumbnail && <img src={blog.thumbnail} alt={blog.title} className="w-full aspect-video rounded-xl object-cover border border-neutral" />}

            <div>
              <h2 className="text-[14px] font-bold text-primary leading-snug line-clamp-3">{blog.title}</h2>
              <p className="text-[11px] text-neutral-dark font-mono mt-1 break-all">{blog.slug}</p>
            </div>

            <BlogStatusBadge status={blog.status} />
          </div>

          {/* Stats */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 size={12} /> Thống kê
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                  <Eye size={11} /> Lượt xem
                </span>
                <span className="text-[13px] font-bold text-primary">{formatNumber(blog.viewCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                  <User size={11} /> Tác giả
                </span>
                <span className="text-[12px] text-primary truncate max-w-[120px]">{blog.author.fullName ?? blog.author.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                  <Calendar size={11} /> Ngày tạo
                </span>
                <span className="text-[11px] text-primary">{formatDate(blog.createdAt)}</span>
              </div>
              {blog.publishedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                    <Clock size={11} /> Đã đăng
                  </span>
                  <span className="text-[11px] text-emerald-600">{formatDate(blog.publishedAt)}</span>
                </div>
              )}
              {blog.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark">Cập nhật</span>
                  <span className="text-[11px] text-primary">{formatDate(blog.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview excerpt */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-2">
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Tóm tắt</p>
            <p className="text-[12px] text-neutral-dark leading-relaxed line-clamp-5">{blog.excerpt}</p>
          </div>
        </div>

        {/* ── Right: Edit form ── */}
        <div className="lg:col-span-3">
          <div className="bg-neutral-light border border-neutral rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-primary">{isEditMode ? "Chỉnh sửa bài viết" : "Nội dung bài viết"}</h3>
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
                    <Check size={14} /> Đã lưu
                  </span>
                )}
                {!isEditMode ? (
                  <Link
                    href={`/admin/blogs/${blog.id}?edit=true`}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active"
                  >
                    <Pencil size={13} /> Chỉnh sửa
                  </Link>
                ) : (
                  <Link href={`/admin/blogs/${blog.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active">
                    <Eye size={13} /> Xem
                  </Link>
                )}
              </div>
            </div>

            {isEditMode ? (
              <BlogForm
                initialData={blogToForm(blog)}
                onSubmit={handleSave}
                saving={saving}
                error={saveError}
                submitLabel="Lưu thay đổi"
                onCancel={() => router.push(`/admin/blogs/${blog.id}`)}
                layout="panel"
              />
            ) : (
              /* View mode — render HTML content */
              <div className="space-y-4">
                <h1 className="text-[20px] font-bold text-primary leading-snug">{blog.title}</h1>
                <div className="flex items-center gap-3 pb-4 border-b border-neutral">
                  {blog.author.avatarImage ? (
                    <img src={blog.author.avatarImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-accent">{(blog.author.fullName ?? blog.author.email)[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-[12px] font-medium text-primary">{blog.author.fullName ?? blog.author.email}</p>
                    {blog.publishedAt && <p className="text-[11px] text-neutral-dark">{formatDate(blog.publishedAt)}</p>}
                  </div>
                </div>
                <div
                  className="
    prose prose-sm max-w-none text-primary
    break-words overflow-hidden
    [&_h1]:text-[20px] [&_h2]:text-[18px] [&_h3]:text-[16px] [&_h4]:text-[14px]
    [&_p]:text-[13px] [&_p]:leading-relaxed
    [&_img]:rounded-xl [&_img]:border [&_img]:border-neutral
    [&_img]:max-w-full [&_img]:h-auto
    [&_pre]:rounded-xl [&_pre]:bg-neutral-light-active [&_pre]:overflow-x-auto
    [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:bg-accent/5 [&_blockquote]:rounded-r-xl
    [&_a]:text-accent
    [&_table]:block [&_table]:overflow-x-auto
  "
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteOpen && (
        <Popzy
          isOpen={deleteOpen}
          onClose={() => !deleting && setDeleteOpen(false)}
          footer={false}
          closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
          content={
            <div className="py-2">
              <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                <Trash2 size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá bài viết?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc muốn xoá</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-5 line-clamp-2">"{blog.title}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Bài viết sẽ được chuyển vào thùng rác.</p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDelete}
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
