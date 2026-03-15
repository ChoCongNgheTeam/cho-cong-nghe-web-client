"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { PackageOpen } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import WishlistToolbar from "./components/WishlistToolbar";
import WishlistPagination from "./components/WishlistPagination";
import { getWishlist } from "./_libs/wishlist.api";
import { Product } from "@/components/product/types";
import { useWishlist } from "@/contexts/WishlistContext";
import { WishlistItem } from "./types/wishlist";
function mapToProduct(item: WishlistItem): Product {
   const { product, price } = item;
   const thumbnail = product.img.find((i) => i.imageUrl)?.imageUrl ?? "";
   return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      thumbnail,
      priceOrigin: price.base,
      inStock: true,
      price: {
         base: price.base,
         final: price.final,
         hasPromotion: price.hasPromotion,
         discountPercentage: price.discountPercentage,
         discountAmount: price.discountAmount,
      },
      rating: {
         average: parseFloat(product.ratingAverage) || 0,
         count: product.ratingCount,
      },
      highlights: [], // ProductHighlight[] cần key + icon, API không trả về
      isWishlist: true,
   };
}

export default function WishlistPage() {
   const { likedIds } = useWishlist();

   const [items, setItems] = useState<WishlistItem[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isFetching, setIsFetching] = useState(false); // soft loading khi đổi limit/page
   const [limit, setLimit] = useState<4 | 8 | 12>(8);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(0);
   const [total, setTotal] = useState(0);
   const isFirstLoad = useRef(true);

   const fetchWishlist = useCallback(
      async (soft = false) => {
         if (soft) {
            setIsFetching(true);
         } else {
            setIsLoading(true);
         }
         try {
            const res = await getWishlist({ page, limit });
            setItems(res.data ?? []);
            setTotal(res.meta.total ?? 0);
            setTotalPages(res.meta.totalPages ?? 0);
         } catch {
            setItems([]);
            setTotal(0);
            setTotalPages(0);
         } finally {
            setIsLoading(false);
            setIsFetching(false);
            isFirstLoad.current = false;
         }
      },
      [page, limit],
   );

   // First load → hard skeleton
   useEffect(() => {
      fetchWishlist(false);
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

   // page/limit thay đổi → soft fetch (giữ items cũ, không giật)
   useEffect(() => {
      if (isFirstLoad.current) return;
      fetchWishlist(true);
   }, [page, limit]); // eslint-disable-line react-hooks/exhaustive-deps

   // Lắng nghe wishlist:update (từ các trang khác)
   useEffect(() => {
      const handler = () => fetchWishlist(true);
      window.addEventListener("wishlist:update", handler);
      return () => window.removeEventListener("wishlist:update", handler);
   }, [fetchWishlist]);

   // Khi likedIds thay đổi → filter bỏ item đã unlike khỏi danh sách hiện tại
   // Không cần re-fetch, UI cập nhật ngay
   useEffect(() => {
      if (isFirstLoad.current) return;
      setItems((prev) => prev.filter((item) => likedIds.has(item.productId)));
   }, [likedIds]);

   // Map và filter đồng thời để đảm bảo đồng bộ
   const products = items
      .filter((item) => likedIds.has(item.productId))
      .map(mapToProduct);

   return (
      <section className="flex-1">
         <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-primary">
               Sản phẩm yêu thích
               {total > 0 && (
                  <span className="ml-2 text-sm font-normal text-neutral-darker">
                     ({total} sản phẩm)
                  </span>
               )}
            </h1>
         </div>

         <WishlistToolbar
            value={limit}
            onChange={(v) => {
               setLimit(v);
               setPage(1);
            }}
         />

         {/* Hard skeleton chỉ lần đầu load */}
         {isLoading ? (
            <WishlistSkeleton count={limit} />
         ) : products.length === 0 ? (
            <WishlistEmpty />
         ) : (
            // opacity transition khi soft fetch — không giật layout
            <div
               className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
               {products.map((product, index) => (
                  <ProductCard
                     key={product.id}
                     product={product}
                     index={index}
                     showWishlist={true}
                  />
               ))}
            </div>
         )}

         {totalPages > 1 && (
            <WishlistPagination
               page={page}
               total={totalPages}
               onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
               }}
            />
         )}
      </section>
   );
}

function WishlistSkeleton({ count }: { count: number }) {
   return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
         {Array.from({ length: count }).map((_, i) => (
            <div
               key={i}
               className="rounded-xl border border-neutral bg-neutral-light p-3 animate-pulse"
            >
               <div className="aspect-square w-full rounded-lg bg-neutral mb-3" />
               <div className="h-3.5 w-3/4 rounded-full bg-neutral mb-2" />
               <div className="h-3 w-1/3 rounded-full bg-neutral" />
            </div>
         ))}
      </div>
   );
}

function WishlistEmpty() {
   return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-neutral-darker">
         <PackageOpen className="w-16 h-16 opacity-30" />
         <p className="text-base font-medium">Chưa có sản phẩm yêu thích nào</p>
         <p className="text-sm">
            Hãy thêm sản phẩm bạn yêu thích để xem lại sau.
         </p>
      </div>
   );
}
