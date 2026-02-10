import { Blog } from "../types/blog.type";

type BlogApiResponse = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  viewCount: number;
  createdAt: string;
  publishedAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
  };
};

export function mapBlog(blog: BlogApiResponse): Blog {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    thumbnail: "/images/default-blog.jpg", // tạm dùng chung
    viewCount: blog.viewCount,
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt,
    commentsCount: 0,
    author: {
      id: blog.author.id,
      fullName: blog.author.fullName,
      email: blog.author.email,
      avatarImage: null,
    },
  };
}
