import { notFound } from "next/navigation";

import { ProductDetailContent } from "./ProductDetailContent";
import { generateMetadata } from "./metadata";
import { getProductBySlug } from "../_lib/index";
import { ProductDetail } from "@/lib/types/product";
import { logError } from "@/lib/monitoring/log-error";

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
  } catch (error) {
    // Log lại để phân biệt "sản phẩm không tồn tại" thật với lỗi API/network —
    // trước đây nuốt hoàn toàn nên 500/lỗi mạng cũng hiện y hệt 404, khó debug production
    logError("ProductDetailPage: getProductBySlug failed", error, { slug });
    notFound();
  }

  return <ProductDetailContent product={product} slug={slug} />;
}

export { generateMetadata };
