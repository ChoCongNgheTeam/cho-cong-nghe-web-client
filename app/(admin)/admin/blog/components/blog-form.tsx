"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AdminBlogDetail,
  AdminBlogUpsertPayload,
  createAdminBlog,
  updateAdminBlog,
} from "../_lib/blog.api";

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

export default function BlogForm({ mode, blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<BlogFormState>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    thumbnail: initialData?.thumbnail ?? "",
    category: extractCategoryValue(initialData?.category),
    tags: "",
    seoTitle: initialData?.seoTitle ?? "",
    seoDescription: initialData?.seoDescription ?? "",
    scheduledAt: initialData?.scheduledAt ?? "",
    isFeatured: initialData?.isFeatured ?? false,
  });

  const userStats = useMemo(
    () => ({
      views: initialData?.viewCount ?? 0,
      rating: initialData?.ratingAvg ?? 0,
      comments: initialData?.commentsCount ?? 0,
    }),
    [initialData]
  );

  const submitLabel = mode === "create" ? "Dang bai viet" : "Cap nhat bai viet";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Vui long nhap tieu de bai viet");
      return;
    }

    const payload: AdminBlogUpsertPayload = {
      title: form.title.trim(),
      slug: form.slug.trim() || toSlug(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      thumbnail: form.thumbnail.trim() || undefined,
      category: form.category.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      seoTitle: form.seoTitle.trim() || undefined,
      seoDescription: form.seoDescription.trim() || undefined,
      isFeatured: form.isFeatured,
      scheduledAt: form.scheduledAt || undefined,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createAdminBlog(payload);
        toast.success("Tao bai viet thanh cong");
        router.push(`/admin/blog/${created.id}`);
      } else if (blogId) {
        await updateAdminBlog(blogId, payload);
        toast.success("Cap nhat bai viet thanh cong");
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khong the luu bai viet";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-primary">
          {mode === "create" ? "Tao bai viet" : "Chinh sua bai viet"}
        </h1>
        <p className="mt-1 text-primary-light">
          {mode === "create" ? "Them bai viet moi" : "Cap nhat noi dung bai viet"}
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-neutral bg-neutral-light p-5">
          <h2 className="mb-4 text-xl font-semibold text-primary">Thong tin co ban</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-primary">Tieu de bai viet</label>
              <input
                value={form.title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug: prev.slug ? prev.slug : toSlug(nextTitle),
                  }));
                }}
                className="h-11 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                placeholder="VD: Xu huong cong nghe 2026"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-primary">Slug</label>
                <button
                  type="button"
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, slug: toSlug(prev.title) }));
                  }}
                >
                  Tao tu dong
                </button>
              </div>
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: toSlug(event.target.value) }))}
                className="h-11 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                placeholder="slug-url-than-thien"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">Danh muc</label>
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                >
                  <option value="">Chon danh muc</option>
                  <option value="tin-moi">Tin moi</option>
                  <option value="khuyen-mai">Khuyen mai</option>
                  <option value="danh-gia-tu-van">Danh gia - Tu van</option>
                  <option value="kien-thuc-doi-song">Kien thuc - Doi song</option>
                  <option value="thu-thuat">Thu thuat</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-primary">The tag</label>
                <input
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                  placeholder="cong-nghe, AI, review"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary">Tom tat</label>
              <textarea
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                className="min-h-24 w-full rounded-lg border border-neutral px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                placeholder="Mo ta ngan ve bai viet..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary">Noi dung bai viet</label>
              <textarea
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                className="min-h-80 w-full rounded-lg border border-neutral px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                placeholder="Nhap noi dung bai viet"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary">Thumbnail URL</label>
              <input
                value={form.thumbnail}
                onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                className="h-11 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary">Thiet lap hoat dong</h3>
            <div className="flex gap-2">
              <Link
                href={form.slug ? `/blog/${form.slug}` : "#"}
                className="rounded-lg border border-neutral px-3 py-2 text-sm font-medium text-primary hover:bg-neutral-light-active"
              >
                Xem truoc
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-neutral-light hover:bg-accent-hover disabled:opacity-60"
              >
                {isSubmitting ? "Dang luu..." : submitLabel}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">Len lich dang</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                />
              </div>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral p-3">
                <span className="text-sm font-medium text-primary">Noi bat</span>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
                  className="h-4 w-4 accent-accent"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary">Detail user</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-primary-light">Luot view</span>
                <span className="font-semibold text-primary">{userStats.views}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-light">Danh gia nguoi dung</span>
                <span className="font-semibold text-primary">{userStats.rating.toFixed(1)} / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-light">Binh luan</span>
                <span className="font-semibold text-primary">{userStats.comments}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary">Preview</h3>
            <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg border border-neutral bg-neutral-light-active">
              <Image
                src={form.thumbnail || "/images/blog-default.jpg"}
                alt={form.title || "blog-preview"}
                fill
                className="object-cover"
              />
            </div>
            <p className="line-clamp-2 text-sm font-semibold text-primary">
              {form.title || "Tieu de bai viet"}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-primary-light">
              {form.excerpt || "Mo ta ngan bai viet se hien thi o day."}
            </p>
          </section>

          <section className="rounded-xl border border-neutral bg-neutral-light p-4">
            <h3 className="mb-3 text-lg font-semibold text-primary">Cau hinh SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">Tieu de SEO</label>
                <input
                  value={form.seoTitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-neutral px-3 text-sm text-primary outline-none focus:border-accent"
                  placeholder="VD: Xu huong cong nghe 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">Mo ta SEO</label>
                <textarea
                  value={form.seoDescription}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                  }
                  className="min-h-20 w-full rounded-lg border border-neutral px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                  placeholder="Mo ta SEO ngan gon..."
                />
              </div>
            </div>
          </section>
        </aside>
      </form>
    </section>
  );
}
