"use client";

import {
   createContext,
   useContext,
   useEffect,
   useState,
   useCallback,
   useRef,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { getWishlist } from "@/(client)/(protected)/profile/wishlist/_libs";

interface WishlistContextValue {
   count: number;
   likedIds: Set<string>; // set productId đã liked
   refresh: () => Promise<void>;
   toggleLiked: (productId: string, liked: boolean) => void; // optimistic update từ Heart
}

const WishlistContext = createContext<WishlistContextValue>({
   count: 0,
   likedIds: new Set(),
   refresh: async () => {},
   toggleLiked: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
   const { isAuthenticated } = useAuth();
   const [count, setCount] = useState(0);
   const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
   const isMounted = useRef(true);

   const refresh = useCallback(async () => {
      if (!isAuthenticated) {
         setCount(0);
         setLikedIds(new Set());
         return;
      }
      try {
         // Lấy tất cả để build likedIds set (limit cao để cover hết)
         const res = await getWishlist({ page: 1, limit: 100 });
         if (!isMounted.current) return;
         const ids = new Set(res.data.map((item) => item.productId));
         setLikedIds(ids);
         setCount(res.meta.total ?? 0);
      } catch {
         if (isMounted.current) {
            setCount(0);
            setLikedIds(new Set());
         }
      }
   }, [isAuthenticated]);

   // Optimistic toggle từ WishlistHeart — không cần re-fetch
   const toggleLiked = useCallback((productId: string, liked: boolean) => {
      setLikedIds((prev) => {
         const next = new Set(prev);
         if (liked) next.add(productId);
         else next.delete(productId);
         return next;
      });
      setCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
   }, []);

   useEffect(() => {
      refresh();
   }, [refresh]);

   useEffect(() => {
      const handler = () => refresh();
      window.addEventListener("wishlist:update", handler);
      return () => window.removeEventListener("wishlist:update", handler);
   }, [refresh]);
   
   useEffect(() => {
      isMounted.current = true;
      return () => {
         isMounted.current = false;
      };
   }, []);

   return (
      <WishlistContext.Provider
         value={{ count, likedIds, refresh, toggleLiked }}
      >
         {children}
      </WishlistContext.Provider>
   );
}

export function useWishlist() {
   return useContext(WishlistContext);
}
