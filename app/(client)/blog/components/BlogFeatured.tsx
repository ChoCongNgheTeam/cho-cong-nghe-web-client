import Link from "next/link";

export default function BlogFeatured({ blogs }: { blogs: any[] }) {
  if (blogs.length === 0) return null;

  return (
    <section className="mt-6 grid grid-cols-3 gap-6">
      {/* Bài lớn */}
      <Link
        href={`/blog/${blogs[0].slug}`}
        className="col-span-2 block"
      >
        <img
          src={blogs[0].thumbnail}
          className="rounded-lg"
        />
        <h2 className="mt-3 text-xl font-bold">
          {blogs[0].title}
        </h2>
      </Link>

      {/* Bài nhỏ */}
      <div className="space-y-4">
        {blogs.slice(1).map((b) => (
          <Link
            key={b.id}
            href={`/blog/${b.slug}`}
            className="flex gap-3"
          >
            <img
              src={b.thumbnail}
              className="h-20 w-28 rounded"
            />
            <p className="font-medium line-clamp-2">
              {b.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
