"use client";

import { useParams } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";

export default function BlogDetailPage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  if (!slug) return null;

  const blogTitle = slug.replace(/-/g, " ");

  return <BlogDetailClient slug={slug} title={blogTitle} />;
}
