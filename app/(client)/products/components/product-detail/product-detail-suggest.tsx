"use client";

import { useEffect, useState } from "react";
import ProductCard from "../../../../components/product/ProductCard";

interface Product {
   id: number;
   name: string;

   thumbnail: string;
   price: price;
}
interface price {
   final: number;
   base: number;
}

export default function ProductDetailSuggest({ slug }: { slug: string }) {
   const [products, setProducts] = useState<Product[]>([]);

   useEffect(() => {
      if (!slug) return;

      const fetchRelated = async () => {
         try {
            const res = await fetch(
               `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/slug/${slug}/related`,
            );
            const data = await res.json();

            // // ⚠️ chỉnh theo response API của bạn
            // const mapped = data.data.map((item: any) => ({
            //   id: item.id,
            //   name: item.name,
            //   price: item.price,
            //   image: item.thumbnail || item.image,
            // }));

            setProducts(data.data);
         } catch (err) {
            console.error("Lỗi gọi API:", err);
         }
      };

      fetchRelated();
   }, [slug]);
   return (
      <div className="container mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12 bg-neutral-light rounded-lg">
         <h1 className="text-lg font-semibold mb-3">Sản phẩm tương tự</h1>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* {products.slice(0, 4).map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            name={p.name}
            price={p.price.final}
            image={p.thumbnail}
          />
        ))} */}
         </div>
      </div>
   );
}
