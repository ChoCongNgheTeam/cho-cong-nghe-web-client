import Image from "next/image";
import Link from "next/link";
import { Blog } from "../types/blog.type";

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
  heroTitleClassName = "text-lg",
}: Props) {
  if (!blogs.length) return null;

  const [hero, ...rest] = blogs;
  const sideBlogs = rest.slice(0, 4);

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-primary">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link href={`/blog/${hero.slug}`} className="block">
            <div
              className={`relative w-full overflow-hidden rounded-lg bg-neutral-light ${heroAspectClassName}`}
            >
              <Image
                src={hero.thumbnail || "/images/blog-default.jpg"}
                alt={hero.title}
                fill
                className="object-cover"
              />
            </div>
            <h3
              className={`mt-4 font-semibold leading-tight text-primary ${heroTitleClassName}`}
            >
              {hero.title}
            </h3>
            <p className="mt-2 text-sm text-primary-light">{hero.excerpt}</p>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {sideBlogs.map((blog, idx) => (
            <Link
              key={`${title}-${idx}-${blog.id}`}
              href={`/blog/${blog.slug}`}
              className="block"
            >
              <div className="overflow-hidden rounded-lg border border-neutral bg-neutral-light hover:shadow-sm">
                <div className="relative aspect-4/3 w-full bg-neutral">
                  <Image
                    src={blog.thumbnail || "/images/blog-default.jpg"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium leading-snug text-primary">
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
