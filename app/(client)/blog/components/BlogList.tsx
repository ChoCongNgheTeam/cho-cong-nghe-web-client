import Link from "next/link";
import Image from "next/image";
import { Blog } from "../types/blog.type";

type Props = {
  blogs: Blog[];
};

export default function BlogList({ blogs }: Props) {
  if (!blogs.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {blogs.map((blog, idx) => (
        <Link
          key={`list-${idx}-${blog.id}`}
          href={`/blog/${blog.slug}`}
          className="flex items-center gap-3 rounded-lg border border-neutral bg-neutral-light p-3 hover:shadow-sm"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded bg-neutral">
            <Image
              src={blog.thumbnail || "/images/avatar.png"}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-primary-light">Mới</p>
            <p className="text-sm font-medium text-primary line-clamp-2">
              {blog.title}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

