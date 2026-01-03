import { SITE_URL } from "@/config/site.config";
import { mockProduct } from "../_lib/mockProduct";

type ProductDetailProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ProductDetailProps) {
  const { slug } = await params;
  const productName = slug.replace(/-/g, " ");
  const url = `${SITE_URL}/products/${slug}`;
  return {
    title: `${mockProduct.name} | Cho Công `,
    description: mockProduct.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: mockProduct.name,
      description: mockProduct.description,
      url,
      images: [
        {
          url: `${SITE_URL}/og/product.jpg`,
        },
      ],
    },
  };
}
