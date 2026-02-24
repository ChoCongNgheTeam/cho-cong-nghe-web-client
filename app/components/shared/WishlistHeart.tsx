"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type WishlistProduct = {
   id: string;
   name: string;
   price: number;
   thumbnail: string;
};

type Props = {
   productId: string;
   defaultLiked?: boolean;
   product?: WishlistProduct;
};
const STORAGE_KEY = "wishlist_products";
export default function WishlistHeart({
   productId,
   defaultLiked = false,
   product,
}: Props) {
   const [liked, setLiked] = useState(() => {
      if (typeof window === "undefined") return defaultLiked;
      try {
         const raw = localStorage.getItem(STORAGE_KEY);
         const data = raw ? (JSON.parse(raw) as WishlistProduct[]) : [];
         return data.some((p) => p.id === productId) || defaultLiked;
      } catch {
         return defaultLiked;
      }
   });
   const [loading, setLoading] = useState(false);

   const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading) return;
      setLoading(true);
      try {
         const nextLiked = !liked;
         setLiked(nextLiked);

         if (typeof window !== "undefined") {
            const raw = localStorage.getItem(STORAGE_KEY);
            const data = raw ? (JSON.parse(raw) as WishlistProduct[]) : [];
            if (nextLiked && product) {
               if (!data.some((p) => p.id === productId)) {
                  data.unshift(product);
               }
            } else {
               const next = data.filter((p) => p.id !== productId);
               data.splice(0, data.length, ...next);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new Event("wishlist:update"));
         }
      } catch (err) {
         console.error("Wishlist error", err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <button
         type="button"
         aria-label="wishlist"
         onClick={handleToggle}
         className={`
            absolute top-2 right-2 z-10
            transition-all duration-200
            cursor-pointer
            hover:scale-110
            ${loading ? "opacity-50" : ""}
         `}
      >
         <Heart
            className="w-7 h-7"
            fill={liked ? "#DC2626" : "none"}
            stroke={liked ? "#DC2626" : "#6b7280"}
            strokeWidth={2}
         />
      </button>
   );
}
