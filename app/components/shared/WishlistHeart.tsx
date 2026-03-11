"use client";

import { useTransition, useCallback } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import { addToWishlist, removeFromWishlist } from "@/(client)/(protected)/profile/wishlist/_libs";

interface WishlistHeartProps {
   productId: string;
   className?: string;
}

export default function WishlistHeart({
   productId,
   className = "",
}: WishlistHeartProps) {
   const { isAuthenticated } = useAuth();
   const { likedIds, toggleLiked } = useWishlist();
   const router = useRouter();
   const [isPending, startTransition] = useTransition();

   // Đọc từ context — luôn đúng, sync toàn app
   const liked = likedIds.has(productId);

   const handleToggle = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
         e.preventDefault();
         e.stopPropagation();
         if (isPending) return;

         if (!isAuthenticated) {
            router.push("/account?tab=login");
            return;
         }

         const nextLiked = !liked;
         toggleLiked(productId, nextLiked); // optimistic update context

         startTransition(async () => {
            try {
               if (nextLiked) {
                  await addToWishlist(productId);
               } else {
                  await removeFromWishlist(productId);
               }
            } catch {
               toggleLiked(productId, liked); // rollback
            }
         });
      },
      [liked, isPending, isAuthenticated, productId, router, toggleLiked],
   );

   return (
      <button
         type="button"
         aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
         onClick={handleToggle}
         disabled={isPending}
         className={`
            absolute top-2 right-2 z-10
            transition-all duration-200 cursor-pointer
            hover:scale-110 active:scale-95
            disabled:opacity-60 disabled:cursor-wait
            ${className}
         `}
      >
         <Heart
            className={`w-7 h-7 transition-all duration-200 ${liked ? "drop-shadow-sm" : ""}`}
            fill={liked ? "#DC2626" : "none"}
            stroke={liked ? "#DC2626" : "#6b7280"}
            strokeWidth={2}
         />
      </button>
   );
}
