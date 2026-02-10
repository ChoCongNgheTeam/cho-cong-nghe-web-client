import { BlogCategory } from "../types/blog.type";

export const BLOG_CATEGORIES: {
  key: BlogCategory;
  label: string;
}[] = [
  { key: "noi-bat", label: "Nổi bật" },
  { key: "tin-moi", label: "Tin mới" },
  { key: "dien-may", label: "Điện máy - Gia dụng" },
  { key: "khuyen-mai", label: "Khuyến mãi" },
  { key: "danh-gia", label: "Đánh giá - Tư vấn" },
  { key: "thu-thuat", label: "Thủ thuật" },
];
