import { SITE_URL } from "@/config/site.config";
import { ProductDetail } from "@/lib/types/product";
import { getProductBySlug } from "../_lib/get-product-by-slug";

type ProductDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductDetailProps) {
  const { slug } = await params;

  // Fetch product data
  let product: ProductDetail;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    // Fallback nếu không fetch được
    return {
      title: "Sản phẩm | Cho Công Nghệ",
      description: "Mua sắm công nghệ chính hãng",
    };
  }

  const url = `${SITE_URL}/products/${slug}`;

  return {
    title: `${product.name} | Cho Công Nghệ`,
    description: product.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      images: [
        {
          url:
            product.variants?.[0]?.images?.[0]?.imageUrl ||
            `${SITE_URL}/og/product.jpg`,
        },
      ],
    },
  };
}
