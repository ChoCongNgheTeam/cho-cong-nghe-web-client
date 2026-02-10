import { Blog } from "../types/blog.type";
import BlogCard from "./BlogCard";

export default function BlogList({ blogs }: { 
    title: string;
    blogs: Blog[] })
     {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
