"use client";

import Image from "next/image";
import Link from "next/link";
import { Aperture } from "lucide-react";
import { FeaturedProduct } from "../../_libs";
import { HighlightIcon } from "../../common/HighlightIcon";
import Badge from "@/components/ui/Badge";

interface HotSaleProductCardProps {
  product: FeaturedProduct;
  index?: number;
  stockCurrent?: number;
  stockTotal?: number;
}

export default function HotSaleProductCard({ product, index = 0, stockCurrent = 9, stockTotal = 10 }: HotSaleProductCardProps) {
  const hasDiscount = product.price.discountPercentage > 0;

  return (
    <Link href={`/products/${product.slug}`} className="group relative flex flex-col bg-neutral-light rounded-sm select-none p-3.5 ease-in-out" style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Sale Star Badge */}
      <Badge />

      {/* Image + Feature Icons */}
      <div className="flex flex-row items-center px-4 pt-7 pb-3">
        {/* Product Image – 62% width */}
        <div className="relative w-[62%] aspect-square">
          {product.thumbnail ? (
            <Image src={product.thumbnail} alt={product.name} fill className="object-contain transition-transform duration-500 group-hover:scale-105" sizes="175px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral rounded">
              <Aperture className="text-neutral-active w-10 h-10" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Feature Icons – 38% width */}
        <div className="flex flex-col w-[38%] self-stretch items-center justify-evenly pt-1 pb-1">
          {product.highlights.map((highlight) => (
            <div key={highlight.key} className="flex flex-col items-center gap-0.75">
              <HighlightIcon icon={highlight.icon} />
              <span className="text-[10px] leading-3.25 text-primary font-medium text-center">
                {highlight.name}
                <br />
                {highlight.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Badge */}
      {/* <div className="px-4 pt-3 pb-2.5">
            <span className="inline-block font-bold rounded text-[11.5px] pt-1.25 pb-1.25 pl-3 pr-3 bg-promotion-light text-promotion-dark">
               Còn {stockCurrent}/{stockTotal} sản phẩm
            </span>
         </div> */}

      {/* Product Name */}
      <div className="px-4 pb-3">
        <h3 className="font-medium line-clamp-2 transition-colors duration-200 text-primary min-h-10">{product.name}</h3>
      </div>

      {/* Pricing */}
      <div className="px-4 pb-5">
        <p className="text-xl font-bold text-promotion">{product.price.final.toLocaleString("vi-VN")}₫</p>
        {hasDiscount && (
          <div className="flex items-center mt-1.5 gap-2">
            <span className="line-through text-[13px] text-neutral-dark font-normal">{product.price.base.toLocaleString("vi-VN")}₫</span>
            <span className="font-bold text-[22px] leading-none text-promotion">-{product.price.discountPercentage}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}
