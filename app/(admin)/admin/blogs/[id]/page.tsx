import BlogForm from "../components/blog-form";

type EditBlogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  return <BlogForm mode="edit" blogId={id} />;
}
