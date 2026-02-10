"use client";

import { useState } from "react";

type Props = {
  productId: number;
  defaultLiked?: boolean;
  product?: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
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
      const data = raw ? (JSON.parse(raw) as Array<{ id: number }>) : [];
      const isInStorage = data.some((p) => p.id === productId);
      return isInStorage || defaultLiked;
    } catch {
      return defaultLiked;
    }
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // 🔒 chỉ chặn click của HEART
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      const nextLiked = !liked;
      setLiked(nextLiked);

      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? (JSON.parse(raw) as Props["product"][]) : [];

        if (nextLiked) {
          if (product) {
            const exists = data.some((p) => p.id === productId);
            if (!exists) {
              data.unshift(product);
            }
          }
        } else {
          const next = data.filter((p) => p.id !== productId);
          data.splice(0, data.length, ...next);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      // 👉 optional: sync wishlist page
      window.dispatchEvent(new Event("wishlist:update"));
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
        text-xl transition
        ${liked ? "text-promotion" : "text-neutral-dark"}
        hover:scale-110
      `}
    >
      {liked ? "❤️" : "🤍"}
    </button>
  );
}

