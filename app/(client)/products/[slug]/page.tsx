import { SITE_URL } from "@/config/site.config";
import { notFound } from "next/navigation";

import { ProductDetailContent } from "./product-detail-content";
import { generateMetadata } from "./metadata";
import { getProductBySlug } from "../_lib/index";
import { ProductDetail } from "@/lib/types/product";

type ProductDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  // Await params trong Next.js 15+
  const { slug } = await params;

  let product: ProductDetail;

  try {
    product = await getProductBySlug(slug);
    // console.log(product);
    const sizeKB = Buffer.byteLength(JSON.stringify(product), "utf8") / 1024;

    // console.log(`Product size: ${sizeKB.toFixed(2)} KB`);
  } catch (error) {
    notFound();
  }

  // Extra safety (optional)
  if (!product) {
    notFound();
  }

  return <ProductDetailContent product={product} slug={slug} />;
}

export { generateMetadata };
