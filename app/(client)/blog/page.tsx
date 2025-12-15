import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Chia sẻ kiến thức Web & Next.js",
  description:
    "Blog chia sẻ kiến thức về Next.js, React, SEO, performance và kinh nghiệm phát triển web thực tế.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Chia sẻ kiến thức Web & Next.js",
    description: "Các bài viết về Next.js, React, SEO và tối ưu hiệu năng website.",
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: `${SITE_URL}/og/blog.jpg`,
      },
    ],
  },
};

const blogs = [
  {
    slug: "nextjs-app-router",
    title: "Hiểu đúng Next.js App Router",
    excerpt: "Giải thích App Router, layout, server component...",
  },
  {
    slug: "seo-voi-nextjs",
    title: "SEO hiệu quả với Next.js",
    excerpt: "SSR, metadata và performance thực tế",
  },
];

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <article key={blog.slug} className="rounded-lg border p-6 hover:bg-gray-50">
            <Link href={`/blog/${blog.slug}`}>
              <h2 className="mb-2 text-xl font-semibold hover:underline">{blog.title}</h2>
            </Link>
            <p className="text-gray-600">{blog.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
