"use client";

import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { viewedProducts } from "@/data/viewedProducts";
import { bankPromotions } from "@/data/bankPromotions";
import Image from "next/image";

export default function ViewedProductsSection() {
   const products = viewedProducts.slice(0, 5);
   const sliderRef = useRef<HTMLDivElement>(null);
   const isDown = useRef(false);
   const startX = useRef(0);
   const scrollLeft = useRef(0);
   const [isDesktop, setIsDesktop] = useState(false);

   const [hoveredBankMap, setHoveredBankMap] = useState<Record<number, number>>(
      {}
   );

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
      const x = e.pageX - sliderRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.1;
      sliderRef.current.scrollLeft = scrollLeft.current - walk;
   };

   return (
      <div
         className="
      bg-white dark:bg-color-neutral-dark
      rounded-2xl
      p-4
      shadow-sm
      transition-colors
    "
      >
         <div
            ref={sliderRef}
            className="
    flex gap-4
    overflow-x-auto
    select-none
    cursor-grab
    snap-x snap-mandatory
    [&::-webkit-scrollbar]:hidden
    [-ms-overflow-style:none]
    [scrollbar-width:none]
  "
            onMouseDown={isDesktop ? onMouseDown : undefined}
            onMouseUp={isDesktop ? stopDrag : undefined}
            onMouseLeave={isDesktop ? stopDrag : undefined}
            onMouseMove={isDesktop ? onMouseMove : undefined}
         >
            {products.map((product) => {
               const hoveredBankId =
                  hoveredBankMap[product.id] ?? bankPromotions[0].id;
               const hoveredBank = bankPromotions.find(
                  (b) => b.id === hoveredBankId
               );

               return (
                  <div
                     key={product.id}
                     className="
    shrink-0
    w-[70vw] sm:w-60 lg:w-60
    snap-start
    bg-color-neutral-light dark:bg-color-neutral
    rounded-xl
    p-3
    flex flex-col
  "
                  >
                     <ProductCard product={product} />

                     {/* BANK WRAPPER */}
                     <div className="mt-auto">
                        {/* DISCOUNT – CỐ ĐỊNH */}
                        <div
                           className="
                  h-8
                  text-[11px]
                  text-color-neutral-darker
                  leading-tight
                  overflow-hidden
                  line-clamp-2
                "
                        >
                           {hoveredBank?.discount}
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
