import BlogForm from "../components/blog-form";
import { getAdminBlogById } from "../_lib/blog.api";

type EditBlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  let blog = null;
  try {
    blog = await getAdminBlogById(id);
  } catch {
    blog = null;
  }

  return <BlogForm mode="edit" blogId={id} initialData={blog ?? undefined} />;
}
