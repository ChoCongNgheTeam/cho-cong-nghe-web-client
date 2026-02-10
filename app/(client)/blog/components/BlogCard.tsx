import Image from "next/image";
import Link from "next/link";
import { Blog } from "../types/blog.type";

export default function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="block">
      <div className="overflow-hidden rounded-lg border hover:shadow">
        <div className="relative h-48">
          <Image
            src={blog.thumbnail || "/images/blog-default.jpg"}
            alt={blog.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold line-clamp-2">{blog.title}</h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {blog.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}
