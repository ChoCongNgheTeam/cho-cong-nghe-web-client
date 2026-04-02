import { BlogType, BLOG_TYPE_LABEL } from "../types/blog.type";

export type CategoryTab = {
  key: string; // "" = tất cả, hoặc BlogType value
  title: string;
};

/** Tabs hiển thị trên CategoryBar — thứ tự cố định */
export const BLOG_CATEGORY_TABS: CategoryTab[] = [
  { key: "", title: "Tất cả" },
  { key: "NOI_BAT", title: BLOG_TYPE_LABEL["NOI_BAT"] },
  { key: "TIN_MOI", title: BLOG_TYPE_LABEL["TIN_MOI"] },
  { key: "DANH_GIA", title: BLOG_TYPE_LABEL["DANH_GIA"] },
  { key: "DIEN_MAY", title: BLOG_TYPE_LABEL["DIEN_MAY"] },
  { key: "KHUYEN_MAI", title: BLOG_TYPE_LABEL["KHUYEN_MAI"] },
];

/** Map BlogType → tab title */
export function getBlogTypeLabel(type?: BlogType | string | null): string {
  if (!type) return "";
  return BLOG_TYPE_LABEL[type as BlogType] ?? type;
}
