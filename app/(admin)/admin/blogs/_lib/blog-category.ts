import { AdminBlog } from "./blog.api";

type AdminBlogCategoryConfig = {
  key: string;
  title: string;
  keywords: string[];
};

export type AdminBlogCategory = {
  key: string;
  title: string;
};

export const ADMIN_BLOG_CATEGORIES: AdminBlogCategoryConfig[] = [
  { key: "tin-moi", title: "Tin mới", keywords: ["tin moi", "ra mat", "xu huong", "cap nhat"] },
  { key: "khuyen-mai", title: "Khuyến mãi", keywords: ["khuyen mai", "uu dai", "giam gia", "flash sale"] },
  { key: "danh-gia-tu-van", title: "Đánh giá - Tư vấn", keywords: ["danh gia", "review", "tu van", "so sanh"] },
  { key: "kien-thuc-doi-song", title: "Kiến thức - Đời sống", keywords: ["kien thuc", "doi song", "suc khoe"] },
  { key: "thu-thuat", title: "Thủ thuật", keywords: ["thu thuat", "meo", "huong dan", "tips"] },
  { key: "dien-may-gia-dung", title: "Điện máy - Gia dụng", keywords: ["dien may", "gia dung", "may giat", "tu lanh", "dieu hoa"] },
];

const categoryMap = new Map(
  ADMIN_BLOG_CATEGORIES.map((item) => [item.key, item])
);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickCategoryByKeywords(pool: string): AdminBlogCategoryConfig | null {
  for (const category of ADMIN_BLOG_CATEGORIES) {
    const matched = category.keywords.some((keyword) =>
      pool.includes(normalizeText(keyword))
    );
    if (matched) return category;
  }
  return null;
}

function pickCategoryByHash(seed: string): AdminBlogCategoryConfig {
  const hash = Array.from(seed).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return ADMIN_BLOG_CATEGORIES[hash % ADMIN_BLOG_CATEGORIES.length];
}

export function getAdminBlogCategoryTitle(categoryKey?: string): string {
  if (!categoryKey) return "Tất cả danh mục";
  return categoryMap.get(categoryKey)?.title ?? "Danh mục khác";
}

export function resolveAdminBlogCategory(blog: AdminBlog): AdminBlogCategory {
  const explicitSlug =
    typeof blog.category === "string"
      ? blog.category
      : blog.category?.slug;

  if (explicitSlug && categoryMap.has(explicitSlug)) {
    const found = categoryMap.get(explicitSlug)!;
    return { key: found.key, title: found.title };
  }

  const categoryName =
    typeof blog.category === "string"
      ? blog.category
      : blog.category?.name ?? "";

  const pool = normalizeText(
    `${blog.title ?? ""} ${blog.slug ?? ""} ${blog.excerpt ?? ""} ${blog.content ?? ""} ${categoryName}`
  );

  const byKeyword = pickCategoryByKeywords(pool);
  if (byKeyword) return { key: byKeyword.key, title: byKeyword.title };

  const byHash = pickCategoryByHash(blog.slug || blog.title || blog.id);
  return { key: byHash.key, title: byHash.title };
}

export function isAdminBlogInCategory(blog: AdminBlog, categoryKey?: string): boolean {
  if (!categoryKey) return true;
  return resolveAdminBlogCategory(blog).key === categoryKey;
}
