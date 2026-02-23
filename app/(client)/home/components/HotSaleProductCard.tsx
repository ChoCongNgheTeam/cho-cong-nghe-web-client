"use client";

import Image from "next/image";
import Link from "next/link";
import { Aperture } from "lucide-react";
import { ProductDTO, formatPrice } from "@/lib/api-demo";

export interface ProductFeature {
   label: string;
   value: string;
}

interface HotSaleProductCardProps {
   product: ProductDTO;
   index?: number;
   stockCurrent?: number;
   stockTotal?: number;
   features?: ProductFeature[];
}

const DEFAULT_FEATURES: ProductFeature[] = [
   { label: "Độ phân giải", value: "3MP" },
   { label: "Độ phân giải", value: "3MP" },
   { label: "Độ phân giải", value: "3MP" },
];

export default function HotSaleProductCard({
   product,
   index = 0,
   stockCurrent = 9,
   stockTotal = 10,
   features = DEFAULT_FEATURES,
}: HotSaleProductCardProps) {
   const hasDiscount =
      product.discount_percentage != null && product.discount_percentage > 0;

   return (
      <Link
         href={`/products/${product.product.id}`}
         className="group relative flex flex-col bg-white rounded-sm select-none p-3.5 ease-in-out"
         style={{ animationDelay: `${index * 0.08}s` }}
      >
         {/* ── Sale Star Badge ─────────────────── */}
         <div className="absolute top-1 left-1 z-20">
            <div
               className="
          w-10 h-10
          bg-red-400
          flex items-center justify-center
          text-white font-bold text-[14px]
          rotate-[-15deg]
        "
               style={{
                  clipPath: `polygon(
            50% 0%,
            60% 12%,
            75% 5%,
            80% 20%,
            95% 25%,
            88% 40%,
            100% 50%,
            88% 60%,
            95% 75%,
            80% 80%,
            75% 95%,
            60% 88%,
            50% 100%,
            40% 88%,
            25% 95%,
            20% 80%,
            5% 75%,
            12% 60%,
            0% 50%,
            12% 40%,
            5% 25%,
            20% 20%,
            25% 5%,
            40% 12%
          )`,
               }}
            >
               Sale
            </div>
         </div>

         {/* ── Image + Feature Icons ────────────── */}
         <div className="flex flex-row items-center px-4 pt-7 pb-3">
            {/* Product Image – 62% width */}
            <div className="relative w-[62%] aspect-square">
               {product.mainImage ? (
                  <Image
                     src={product.mainImage.imagePath}
                     alt={product.mainImage.altText}
                     fill
                     className="object-contain transition-transform duration-500 group-hover:scale-105"
                     sizes="175px"
                  />
               ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                     <Aperture
                        className="text-gray-200 w-10 h-10"
                        strokeWidth={1}
                     />
                  </div>
               )}
            </div>

            {/* Feature Icons – 38% width */}
            <div className="flex flex-col w-[38%] self-stretch items-center justify-evenly pt-1 pb-1">
               {features.map(({ label, value }, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.75">
                     <Aperture
                        className="w-7 h-7 text-[#c5c5c5]"
                        strokeWidth={1}
                     />
                     <span className="text-[10px] leading-3.25 text-[#1a3a5c] font-medium text-center">
                        {label}
                        <br />
                        {value}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* ── Thin Separator ───────────────────── */}
         <div className="mx-4 h-px bg-[#efefef]" />

         {/* ── Stock Badge ──────────────────────── */}
         <div className="px-4 pt-3 pb-2.5">
            <span className="inline-block font-bold rounded text-[11.5px] pt-1.25 pb-1.25 pl-3 pr-3 bg-[#fce8e8] text-[#c0392b]">
               Còn {stockCurrent}/{stockTotal} sản phẩm
            </span>
         </div>

         {/* ── Product Name ─────────────────────── */}
         <div className="px-4 pb-3">
            <h3 className="font-medium line-clamp-2 transition-colors duration-200 text-primary min-h-10">
               {product.product.name}
            </h3>
         </div>

         {/* ── Pricing ──────────────────────────── */}
         <div className="px-4 pb-5">
            <p className="font-bold text-2xl leading-9 text-promotion m-0">
               {formatPrice(product.sale_price)}
            </p>
            {hasDiscount && (
               <div className="flex items-center mt-1.5 gap-2">
                  <span className="line-through text-[13px] text-[#aaaaaa] font-normal">
                     {formatPrice(product.original_price)}
                  </span>
                  <span className="font-bold text-[22px] leading-none text-[#e74c3c]">
                     -{product.discount_percentage}%
                  </span>
               </div>
            )}
         </div>
      </Link>
   );
}
