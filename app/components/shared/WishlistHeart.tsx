"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addToWishlist, checkWishlist, removeFromWishlist } from "@/(client)/(protected)/profile/wishlist/_lib/wishlist.api";

type Props = {
   productVariantId: string;
   defaultLiked?: boolean;
   onToggle?: (liked: boolean) => void;
};

export default function WishlistHeart({
   productVariantId,
   defaultLiked = false,
   onToggle,
}: Props) {
   const [liked, setLiked] = useState(defaultLiked);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      let mounted = true;

      const syncWishlist = async () => {
         if (!productVariantId) return;
         try {
            const isInWishlist = await checkWishlist(productVariantId);
            if (mounted) setLiked(isInWishlist);
         } catch {
            if (mounted) setLiked(defaultLiked);
         }
      };

      syncWishlist();

      return () => {
         mounted = false;
      };
   }, [productVariantId, defaultLiked]);

   const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (loading) return;

      const nextLiked = !liked;
      setLiked(nextLiked);
      setLoading(true);

      try {
         if (nextLiked) {
            await addToWishlist(productVariantId);
         } else {
            await removeFromWishlist(productVariantId);
         }
         onToggle?.(nextLiked);
         if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("wishlist:update"));
         }
      } catch (err) {
         setLiked(!nextLiked);
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
