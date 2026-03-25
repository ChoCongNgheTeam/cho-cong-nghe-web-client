import { BlogCategory } from "../types/blog.type";

type CategoryConfig = {
  key: string;
  title: string;
  keywords?: string[];
};

export const BLOG_CATEGORIES: CategoryConfig[] = [
  { key: "featured", title: "Nổi bật" },
  { key: "tin-moi", title: "Tin mới", keywords: ["mới", "ra mắt", "update", "xu hướng"] },
  { key: "danh-gia-tu-van", title: "Đánh giá - Tư vấn", keywords: ["đánh giá", "review", "tư vấn", "so sánh"] },
];

const FALLBACK_CATEGORY = "tin-moi";

const categoryMap = new Map(BLOG_CATEGORIES.map((item) => [item.key, item]));

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toBlogCategory(key: string): BlogCategory {
  const category = categoryMap.get(key) ?? categoryMap.get(FALLBACK_CATEGORY)!;
  return {
    id: category.key,
    slug: category.key,
    name: category.title,
  };
}

export function resolveBlogCategory(
  title: string,
  excerpt: string,
  slug: string,
  explicitSlug?: string | null
): BlogCategory {
  if (explicitSlug && categoryMap.has(explicitSlug)) {
    return toBlogCategory(explicitSlug);
  }

  const normalizedPool = normalizeText(`${title} ${excerpt} ${slug}`);

  for (const category of BLOG_CATEGORIES) {
    if (!category.keywords || category.key === "featured") continue;
    const matched = category.keywords.some((keyword) => normalizedPool.includes(normalizeText(keyword)));
    if (matched) return toBlogCategory(category.key);
  }

  const hashSeed = slug || title || excerpt;
  if (hashSeed) {
    const hash = Array.from(hashSeed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const dynamicList = BLOG_CATEGORIES.filter((item) => item.key !== "featured");
    const picked = dynamicList[hash % dynamicList.length];
    return toBlogCategory(picked.key);
  }

  return toBlogCategory(FALLBACK_CATEGORY);
}

export function isBlogInCategory(categoryKey: string | undefined, blogCategorySlug: string | undefined): boolean {
  if (!categoryKey) return true;
  if (categoryKey === "featured") return true;
  return categoryKey === blogCategorySlug;
}

