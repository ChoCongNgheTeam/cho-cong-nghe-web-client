export type BlogCategory =
  | "featured"
  | "news"
  | "review"
  | "tips"
  | "entertainment";

export interface Blog {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  thumbnail: string;
  category: BlogCategory;
  author: string;
  publishedAt: string;
  isFeatured?: boolean;
}


