"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { featuredProducts } from "../../data/featuredProducts";
import ProductCard from "./ProductCard";
import Button from "../ui/button";

export default function FeaturedProductsSection() {
  const mainProduct = featuredProducts[0];
  const productList = featuredProducts.slice(1, 5);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const stopDrag = () => (isDown.current = false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <section className="bg-[#fdf2f2] py-6 mb-6 rounded-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex gap-6 w-full">

          {/* ===== BANNER TRÁI ===== */}
          <div className="shrink-0 w-55 lg:w-60">
            <div className="relative bg-linear-to-b from-yellow-400 to-orange-500 rounded-xl p-4 text-white h-full flex flex-col justify-between">
              {/* DISCOUNT */}
              <span className="absolute top-2 right-2 bg-yellow-200 text-orange-600 text-xs font-bold px-2 py-0.5 rounded">
                -{mainProduct.variant.discount}%
              </span>

              {/* CONTENT */}
              <div>
                <h3 className="font-bold text-lg mb-1">Ưu đãi đặc biệt</h3>
                <p className="text-xs opacity-90">
                  Tiết kiệm đến {mainProduct.variant.discount}%
                </p>
              </div>

              {/* CTA */}
              <Link href={`/products/${mainProduct.slug}`}>
                <Button
                  variant="yellow-outline"
                  className="text-orange-600 font-semibold text-sm"
                >
                  Mua ngay
                </Button>
              </Link>
            </div>
          </div>

          {/* ===== SLIDER PHẢI ===== */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto select-none cursor-grab py-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onMouseDown={isDesktop ? onMouseDown : undefined}
              onMouseUp={isDesktop ? stopDrag : undefined}
              onMouseLeave={isDesktop ? stopDrag : undefined}
              onMouseMove={isDesktop ? onMouseMove : undefined}
            >
              {productList.map((product) => (
                <div
                  key={product.id}
                  className="shrink-0 w-70 sm:w-60"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
