"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Eye, Save } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useToasty } from "@/components/Toast";
import {
  AdminBlogDetail,
  AdminBlogUpsertPayload,
  createAdminBlog,
  getAdminBlogById,
  updateAdminBlog,
} from "../_lib/blog.api";
import CkEditorField from "./ckeditor-field";

type BlogFormProps = {
  mode: "create" | "edit";
  blogId?: string;
  initialData?: AdminBlogDetail;
};

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  scheduledAt: string;
  isFeatured: boolean;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractCategoryValue(category: AdminBlogDetail["category"]): string {
  if (!category) return "";
  return typeof category === "string" ? category : category.slug ?? category.name ?? "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDateTimeLocal(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function resolveTags(value?: AdminBlogDetail["tags"]): string {
  if (!value || value.length === 0) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      return item.slug ?? item.name ?? "";
    })
    .filter(Boolean)
    .join(", ");
}

function mapBlogDetailToForm(blog: AdminBlogDetail): BlogFormState {
  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? "",
    thumbnail: blog.thumbnail ?? "",
    category: extractCategoryValue(blog.category),
    tags: resolveTags(blog.tags),
    seoTitle: blog.seoTitle ?? "",
    seoDescription: blog.seoDescription ?? "",
    scheduledAt: toDateTimeLocal(blog.scheduledAt),
    isFeatured: blog.isFeatured ?? true,
  };
}

export default function BlogForm({ mode, blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const toast = useToasty();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [showPreviewContent, setShowPreviewContent] = useState(false);
  const submitModeRef = useRef<"draft" | "publish">("publish");

  const [form, setForm] = useState<BlogFormState>(
    initialData
      ? mapBlogDetailToForm(initialData)
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          thumbnail: "",
          category: "",
          tags: "",
          seoTitle: "",
          seoDescription: "",
          scheduledAt: "",
          isFeatured: true,
        }
  );

  const [loadingInitialData, setLoadingInitialData] = useState(mode === "edit" && !initialData);

  const userStats = useMemo(
    () => ({
      views: initialData?.viewCount ?? 0,
      rating: initialData?.ratingAvg ?? 0,
      comments: initialData?.commentsCount ?? 0,
    }),
    [initialData]
  );

  const submitLabel = mode === "create" ? "Hoạt động" : "Cập nhật";

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    if (mode !== "edit" || !blogId || initialData) return;

    let isMounted = true;

    const fetchBlogDetail = async () => {
      try {
        setLoadingInitialData(true);
        const blog = await getAdminBlogById(blogId);
        if (isMounted) setForm(mapBlogDetailToForm(blog));
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Không thể tải dữ liệu bài viết";
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoadingInitialData(false);
      }
    };

    void fetchBlogDetail();

    return () => {
      isMounted = false;
    };
  }, [blogId, initialData, mode, toast]);

  if (loadingInitialData) {
    return (
      <section className="space-y-4 bg-neutral-light-active p-6">
        <h1 className="text-2xl font-semibold text-primary">Đang tải dữ liệu bài viết...</h1>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    if (form.title.trim().length < 3) {
      toast.error("Tiêu đề phải có ít nhất 3 ký tự");
      return;
    }

    const plainContent = stripHtml(form.content);
    if (!plainContent) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    if (plainContent.length < 10) {
      toast.error("Nội dung phải có ít nhất 10 ký tự");
      return;
    }

    const scheduledAtIso = form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined;

    const payload: AdminBlogUpsertPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      imageFile: thumbnailFile ?? undefined,
      imageUrl: form.thumbnail.trim() || undefined,
      status: submitModeRef.current === "publish" ? "PUBLISHED" : "DRAFT",
      publishedAt: submitModeRef.current === "publish" ? scheduledAtIso : undefined,
      slug: form.slug.trim() || toSlug(form.title),
      excerpt: form.excerpt.trim() || plainContent.slice(0, 180),
      thumbnail: form.thumbnail.trim() || undefined,
      category: form.category.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      seoTitle: form.seoTitle.trim() || undefined,
      seoDescription: form.seoDescription.trim() || undefined,
      isFeatured: form.isFeatured,
      scheduledAt: scheduledAtIso,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createAdminBlog(payload);
        toast.success(
          submitModeRef.current === "publish"
            ? "Đăng bài viết thành công"
            : "Lưu nháp bài viết thành công"
        );
        router.push("/admin/blogs");
      } else if (blogId) {
        await updateAdminBlog(blogId, payload);
        toast.success(
          submitModeRef.current === "publish"
            ? "Cập nhật và đăng bài viết thành công"
            : "Cập nhật bài viết nháp thành công"
        );
        router.refresh();
      }
    } catch (error) {
      console.error("[BlogForm submit error]", error);
      const message = (() => {
        if (error instanceof ApiError) {
          const fieldErrors = error.data?.errors as Record<string, string> | undefined;
          if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            return Object.values(fieldErrors)[0];
          }
          return (error.data?.message as string | undefined) ?? error.message;
        }
        if (error instanceof Error) return error.message;
        return "Không thể lưu bài viết";
      })();
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-neutral bg-neutral-light-active px-4 text-[14px] text-primary outline-none transition focus:border-accent";

  return (
    <section className="space-y-6 bg-neutral-light-active p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight text-primary">
          {mode === "create" ? "Tạo bài viết" : "Chỉnh sửa bài viết"}
        </h1>
        <p className="text-base text-primary-light">
          {mode === "create" ? "Thêm bài viết mới" : "Cập nhật nội dung bài viết"}
        </p>
      </header>

      <h2 className="text-xl font-semibold leading-tight text-primary">Điền đầy đủ thông tin sản phẩm</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-neutral bg-neutral-light p-5">
          <span className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-neutral-light">
            Thông tin cơ bản
          </span>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-base font-semibold text-primary">Tiêu đề bài viết</label>
              <input
                value={form.title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setForm((prev) => ({ ...prev, title: nextTitle, slug: toSlug(nextTitle) }));
                }}
                className={inputClass}
                placeholder="VD: Sản phẩm công nghệ mới"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-primary">Slug (URL thân thiện)</label>
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
                className={inputClass}
                placeholder="Slug (tự sinh, chỉ chữ thường, số và dấu gạch ngang)"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-semibold text-primary">Danh mục</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className={inputClass}
                >
                  <option value="">Công nghệ</option>
                  <option value="tin-moi">Tin mới</option>
                  <option value="khuyen-mai">Khuyến mãi</option>
                  <option value="danh-gia-tu-van">Đánh giá - Tư vấn</option>
                  <option value="kien-thuc-doi-song">Kiến thức - Đời sống</option>
                  <option value="thu-thuat">Thủ thuật</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-primary">Thẻ tag</label>
                <input
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className={inputClass}
                  placeholder="Công nghệ, điện máy + Thêm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-base font-semibold text-primary">Ảnh bài viết</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setThumbnailFile(file);
                  }}
                  className="block h-12 w-full cursor-pointer rounded-xl border border-neutral bg-neutral-light-active px-4 py-2 text-[14px] text-primary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-light hover:file:bg-accent-hover"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-primary">URL ảnh</label>
                <input
                  value={form.thumbnail}
                  onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-primary">Nội dung bài viết</label>
              <CkEditorField
                value={form.content}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-xl font-semibold text-primary">Thiết lập Hoạt động</h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewContent((prev) => !prev)}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-neutral text-[14px] font-medium text-primary hover:bg-neutral-light-active"
              >
                <Eye size={14} />
                Xem trước
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  submitModeRef.current = "draft";
                }}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-neutral text-[14px] font-medium text-primary hover:bg-neutral-light-active disabled:opacity-60"
              >
                <Save size={14} />
                Lưu Ẩn
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  submitModeRef.current = "publish";
                }}
                className="h-10 rounded-lg bg-accent text-[14px] font-semibold text-neutral-light hover:bg-accent-hover disabled:opacity-60"
              >
                {isSubmitting ? "Đang lưu..." : submitLabel}
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-base font-semibold text-primary">Lên lịch đăng</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  className={inputClass}
                />
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-light"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[15px] text-primary">Nổi bật :</span>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                className={`relative h-8 w-16 rounded-full transition ${form.isFeatured ? "bg-accent" : "bg-neutral"}`}
                aria-label="Bật tắt nổi bật"
              >
                {form.isFeatured ? (
                  <span className="absolute left-3 top-1.5 text-[11px] font-semibold text-neutral-light">ON</span>
                ) : null}
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-black transition ${form.isFeatured ? "left-9" : "left-1"}`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-xl font-semibold text-primary">Xu hướng công nghệ 2026 mới nhất</h3>
            <div className="relative mb-3 aspect-video overflow-hidden rounded-lg border border-neutral bg-neutral-light-active">
              <Image
                src={thumbnailPreviewUrl || form.thumbnail || "/images/avatar.png"}
                alt={form.title || "blog-preview"}
                fill
                sizes="(min-width: 1280px) 420px, 100vw"
                className="object-cover"
              />
            </div>

            <p className="line-clamp-2 text-lg font-semibold leading-tight text-primary">
              {form.title || "Xu hướng công nghệ năm 2026"}
            </p>
            <p className="mt-1 line-clamp-2 text-[14px] text-primary-light">
              {form.excerpt || stripHtml(form.content).slice(0, 120) || "Chocongnghe.com/tin-tuc/xu-huong-cong-nghe-nam-2026"}
            </p>

            {showPreviewContent ? (
              <div className="mt-3 rounded-lg border border-neutral bg-neutral-light-active p-3">
                <p className="mb-2 text-[12px] font-medium text-primary-light">Nội dung bài :</p>
                <div
                  className="prose prose-sm max-w-none text-primary"
                  dangerouslySetInnerHTML={{ __html: form.content || "<p>Chưa có nội dung.</p>" }}
                />
              </div>
            ) : null}

            <h3 className="mt-5 mb-3 text-2xl font-semibold leading-none text-primary">Cấu hình SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-base font-semibold text-primary">Tiêu đề SEO</label>
                <input
                  value={form.seoTitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
                  className={inputClass}
                  placeholder="VD: Xu hướng công nghệ năm 2026"
                />
              </div>

              <div>
                <label className="mb-2 block text-base font-semibold text-primary">Mô tả SEO</label>
                <textarea
                  value={form.seoDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
                  className="min-h-24 w-full rounded-xl border border-neutral bg-neutral-light-active px-4 py-2 text-[14px] text-primary outline-none transition focus:border-accent"
                  placeholder="VD: Khám phá những công nghệ mới năm 2026 và là xu hướng trong năm"
                />
              </div>
            </div>
          </section>

          {mode === "edit" ? (
            <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
              <h3 className="mb-3 text-xl font-semibold text-primary">Chi tiết bài viết</h3>
              <div className="space-y-2 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="text-primary-light">Lượt xem</span>
                  <span className="font-semibold text-primary">{userStats.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-light">Đánh giá người dùng</span>
                  <span className="font-semibold text-primary">{userStats.rating.toFixed(1)} / 5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-light">Bình luận</span>
                  <span className="font-semibold text-primary">{userStats.comments}</span>
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </form>
    </section>
  );
}
