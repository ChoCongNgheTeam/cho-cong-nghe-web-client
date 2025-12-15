import { SITE_URL } from "@/config/site.config";
import { notFound } from "next/navigation";

type BlogDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================
   SEO METADATA
========================= */
export async function generateMetadata({ params }: BlogDetailProps) {
  const { slug } = await params;

  const blogTitle = slug.replace(/-/g, " ");
  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title: `Bài viết | ${blogTitle}`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Bài viết | ${blogTitle}`,
      url,
      images: [
        {
          url: `${SITE_URL}/og/blog.jpg`,
        },
      ],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;

  // Giả lập check (sau này thay bằng fetch)
  if (!slug) {
    notFound();
  }

  const blogTitle = slug.replace(/-/g, " ");

  return (
    <article className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold">{blogTitle}</h1>

      <p className="mb-6 text-gray-600">Published on 2025 · 5 min read</p>

      <div className="prose max-w-none">
        <p>
          Đây là nội dung chi tiết của bài blog với slug: <b>{slug}</b>.
        </p>
        <p>Sau này bạn sẽ fetch data ở Server Component và render markdown tại đây.</p>
      </div>
    </article>
  );
}
