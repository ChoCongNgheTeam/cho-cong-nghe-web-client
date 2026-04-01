"use client";

import Image from "next/image";
import Link from "next/link";
import { Slidezy } from "@/components/Slider";
import { Blog } from "../types/blog.type";
import BlogCard from "./BlogCard";

type Props = {
  title: string;
  blogs: Blog[];
  heroAspectClassName?: string;
  heroTitleClassName?: string;
};

export default function BlogSection({
  title,
  blogs,
  heroAspectClassName = "aspect-video",
  heroTitleClassName = "text-xl sm:text-2xl",
}: Props) {
  if (!blogs.length) return null;

  const [hero, ...rest] = blogs;
  const sideBlogs = rest.slice(0, 4);

  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="mb-2 text-lg sm:text-xl font-semibold tracking-tight text-primary">
        {title}
      </h2>
      <div className="mb-5 h-0.5 w-10 rounded-full bg-accent/50" />

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

      <div className="hidden md:grid grid-cols-1 gap-5 sm:gap-7 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link href={`/blog/${hero.slug}`} className="group block">
            <div
              className={`relative w-full overflow-hidden rounded-2xl border border-neutral/60 bg-neutral-light/70 shadow-sm ${heroAspectClassName}`}
            >
              <Image
                src={hero.thumbnail || "/images/avatar.png"}
                alt={hero.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/12 via-black/5 to-transparent" />
            </div>
            <h3
              className={`mt-4 font-semibold leading-snug tracking-tight text-primary group-hover:text-accent transition-colors ${heroTitleClassName}`}
            >
              {hero.title}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-primary/70 leading-relaxed line-clamp-3">
              {hero.excerpt}
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
          {sideBlogs.map((blog, idx) => (
            <Link
              key={`${title}-${idx}-${blog.id}`}
              href={`/blog/${blog.slug}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral/60 bg-neutral-light/70 shadow-sm hover:shadow transition-shadow">
                <div className="relative aspect-4/3 w-full bg-neutral">
                  <Image
                    src={blog.thumbnail || "/images/avatar.png"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-sm sm:text-base font-medium leading-snug tracking-tight text-primary/90 line-clamp-2 group-hover:text-accent transition-colors">
                    {blog.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

