import type { AdminBlogDetail } from "../_lib/blog.api";
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toDateTimeLocal(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function extractCategoryValue(category: AdminBlogDetail["category"]): string {
  if (!category) return "";
  return typeof category === "string" ? category : category.slug ?? category.name ?? "";
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

export function mapBlogDetailToForm(blog: AdminBlogDetail) {
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
