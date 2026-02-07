"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  productId: number;
  defaultLiked?: boolean;
};

const API = "http://localhost:5000";

export default function WishlistHeart({
  productId,
  defaultLiked = false,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(defaultLiked);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const handleToggle = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation(); // 🔒 không cho click lan ra card / link

    if (!token) {
      router.push("/account");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      if (!liked) {
        // ➕ thêm wishlist
        await fetch(`${API}/wishlist/${productId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLiked(true); // tim sáng tại chỗ
      } else {
        // ➖ bỏ wishlist
        await fetch(`${API}/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLiked(false);
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
        text-xl transition
        ${liked ? "text-promotion" : "text-neutral-dark"}
        hover:scale-110
      `}
    >
      {liked ? "❤️" : "🤍"}
    </button>
  );
}
