import BlogCard from "./BlogCard";
import { Blog } from "../types/blog.type";

export default function BlogSection({
  title,
  blogs,
}: {
  title: string;
  blogs: Blog[];
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-4 gap-6">
        {blogs.map((b) => (
          <BlogCard key={b.id} blog={b} />
        ))}
      </div>
    </section>
  );
}
