import { SITE_URL } from "@/config/site.config";
import { notFound } from "next/navigation";
import { mockProduct } from "../_lib/mockProduct";
import { ProductDetailContent } from "./product-detail-content";
import { generateMetadata } from "./metadata";

type ProductDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailProps) {
  const { slug } = await params;
  const productName = slug.replace(/-/g, " ");

  // Giả lập check (sau này thay bằng fetch)
  if (!productName) {
    notFound();
  }

  return <ProductDetailContent />;
}

export { generateMetadata };
