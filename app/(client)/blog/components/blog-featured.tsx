import { BLOG_FEATURED } from "../_lib/mock-blog";
import BlogCard from "./blog-card";

export default function BlogFeatured() {
  const featured = BLOG_FEATURED.find((b) => b.isFeatured);
  const smallBlogs = BLOG_FEATURED.filter((b) => !b.isFeatured).slice(0, 4);

  if (!featured) return null;

  return (
    <section className=" space-y-4">
      <h2 className="text-4xl font-semibold">Nổi bật</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <BlogCard blog={featured} variant="featured" />
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {smallBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} size="small" />
          ))}
        </div>
      </div>
    </section>
  );
}
