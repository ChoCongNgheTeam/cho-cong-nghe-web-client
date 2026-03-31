"use client";

import Image from "next/image";
import Link from "next/link";
import { formatVND } from "@/helpers";
import type { Product } from "./product-card.types";

interface ProductCardProps {
  product: Product;
}

const COLOR_MAP: Record<string, string> = {
  black: "bg-gray-900",
  white: "bg-white border border-gray-300",
  gray: "bg-gray-400",
  green: "bg-green-400",
  blue: "bg-blue-500",
  red: "bg-red-500",
  gold: "bg-yellow-600",
};

export default function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.originalPrice > 0 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
          -{discountPercent}%
        </div>
      )}

      {/* Product Image Section */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Features - compact row */}
        {product.features && product.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {product.features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                <span>{feature.icon}</span>
                <span className="hidden sm:inline">{feature.label}</span>
              </div>
            ))}
            {product.features.length > 3 && (
              <span className="text-xs text-gray-500 self-center">+{product.features.length - 3}</span>
            )}
          </div>
        )}

        {/* Color Palette */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-2 mb-3">
            {product.colors.map((color, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer ${
                  COLOR_MAP[color.toLowerCase()] || "bg-gray-300"
                }`}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Pricing Section - Spacer to push to bottom */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-lg font-bold text-gray-900">
              {formatVND(product.price)}
            </p>
            {product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">
                {formatVND(product.originalPrice)}
              </p>
            )}
          </div>
          
          {/* Save amount */}
          {product.discount > 0 && (
            <p className="text-xs text-green-600 font-semibold">
              Tiết kiệm {formatVND(product.originalPrice - product.price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
