import Image from "next/image";
import Link from "next/link";
import { Blog } from "../types/blog.type";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block">
      <div className="overflow-hidden rounded-lg border border-neutral bg-neutral-light hover:shadow">
        <div className="relative h-40 sm:h-48">
          <Image
            src={blog.thumbnail || "/images/avatar.png"}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-primary text-sm sm:text-base">{blog.title}</h3>
          <p className="mt-2 text-sm text-primary-light">
            {blog.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}


