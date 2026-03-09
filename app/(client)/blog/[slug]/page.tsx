import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getBlogBySlug } from "../_lib/blog.api";
import { BlogDetail } from "../types/blog.type";
import BlogDetailClient from "./BlogDetailClient";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let blog: BlogDetail;

  try {
    blog = await getBlogBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <BlogDetailClient blog={blog} />;
}
