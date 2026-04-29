import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useRoleNavigation() {
   const router = useRouter();
   const { user } = useAuth();
   const isAdmin = user?.role === "ADMIN";

// useRoleNavigation.ts
      const navigateToComment = useCallback(
      (commentId?: string, productSlug?: string) => {
         if (isAdmin) {
            const param = commentId ? `?commentId=${commentId}` : "";
            router.push(`/admin/comments${param}`);
         } else {
            // User: đến product rồi scroll xuống comment
            const param = commentId ? `?commentId=${commentId}` : "";
            router.push(`/products/${productSlug}${param}`);
         }
      },
      [isAdmin, router],
      );

   const navigateToProduct = useCallback(
      (slug: string, productId?: string) => {
         if (isAdmin) {
            router.push(`/admin/products/${productId ?? slug}`);
         } else {
            router.push(`/products/${slug}`);
         }
      },
      [isAdmin, router],
   );

   const navigateToOrders = useCallback(
      (orderCode?: string) => {
         if (isAdmin) {
            const param = orderCode ? `?highlight=${orderCode}` : "";
            router.push(`/admin/orders${param}`);
         } else {
            const param = orderCode ? `?highlight=${orderCode}` : "";
            router.push(`/profile/orders${param}`);
         }
      },
      [isAdmin, router],
   );

   const navigateToReview = useCallback(
      (reviewId?: string, productSlug?: string) => {
         if (isAdmin) {
            const param = reviewId ? `?reviewId=${reviewId}` : "";
            router.push(`/admin/reviews${param}`); // ← đổi route cho đúng
         } else {
            const param = reviewId ? `?reviewId=${reviewId}` : "";
            router.push(`/products/${productSlug}${param}`);
         }
      },
      [isAdmin, router],
   );

   return {
      isAdmin,
      navigateToComment,
      navigateToProduct,
      navigateToOrders,
      navigateToReview,
   };
}
