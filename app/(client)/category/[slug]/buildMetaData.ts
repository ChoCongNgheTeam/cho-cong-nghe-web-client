import type { Metadata } from "next";
import { slugToTitle } from "../components/SlugToTitle";

const SITE_NAME = "Cho Cong Nghe";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://example.com";
export function buildCategoryMetadata(slug: string, page: number): Metadata {
   const categoryTitle = slugToTitle(slug);

   const title =
      page > 1
         ? `${categoryTitle} - Trang ${page} | ${SITE_NAME}`
         : `${categoryTitle} | ${SITE_NAME}`;

   const description = `Khám phá bộ sưu tập ${categoryTitle} đa dạng, chính hãng, giá tốt tại ${SITE_NAME}. Giao hàng nhanh, bảo hành uy tín.`;

   const canonicalUrl =
      page > 1
         ? `${BASE_URL}/category/${slug}?page=${page}`
         : `${BASE_URL}/category/${slug}`;

   return {
      title,
      description,
      alternates: {
         canonical: canonicalUrl,
      },
      openGraph: {
         title,
         description,
         url: canonicalUrl,
         siteName: SITE_NAME,
         locale: "vi_VN",
         type: "website",
         images: [
            {
               url: `${BASE_URL}/og/category/${slug}.jpg`, // đặt ảnh OG theo slug nếu có
               width: 1200,
               height: 630,
               alt: categoryTitle,
            },
         ],
      },
      twitter: {
         card: "summary_large_image",
         title,
         description,
      },
      robots:
         page > 1
            ? { index: false, follow: true }
            : { index: true, follow: true },
   };
}
