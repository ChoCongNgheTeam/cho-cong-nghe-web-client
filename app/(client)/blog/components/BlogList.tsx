"use client";

import Link from "next/link";
import Image from "next/image";
import { Slidezy } from "@/components/Slider";
import { Blog } from "../types/blog.type";
import BlogCard from "./BlogCard";

type Props = {
  blogs: Blog[];
};

export default function BlogList({ blogs }: Props) {
  if (!blogs.length) return null;

  return (
    <>
      <div className="md:hidden">
        <Slidezy
          items={{ mobile: 1, tablet: 2, desktop: 3 }}
          gap={16}
          speed={400}
          loop={false}
          nav={false}
          controls={true}
          slideBy={1}
          draggable={true}
        >
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </Slidezy>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <p className="text-xs text-primary-light">M?i</p>
              <p className="text-sm font-medium text-primary line-clamp-2">
                {blog.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}


