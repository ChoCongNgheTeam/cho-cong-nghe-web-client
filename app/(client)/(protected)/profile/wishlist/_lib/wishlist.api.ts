import apiRequest from "@/lib/api";
import { WishlistProduct } from "../types/wishlist";

type WishlistImage = {
  imageUrl: string | null;
};

type WishlistProductVariant = {
  id: string;
  price: number | string;
  product: {
    name: string;
    slug: string;
    img: WishlistImage[];
  };
};

type WishlistItem = {
  id: string;
  productVariantId: string;
  productVariant: WishlistProductVariant;
};

type WishlistResponse = {
  data: WishlistItem[];
  total: number;
  message: string;
};

type AddWishlistResponse = {
  data: WishlistItem;
  message: string;
};

type RemoveWishlistResponse = {
  message: string;
};

type CheckWishlistResponse = {
  data: {
    isInWishlist: boolean;
  };
  message: string;
};

const toNumber = (value: number | string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapWishlistItem = (item: WishlistItem): WishlistProduct => ({
  id: item.productVariantId,
  wishlistItemId: item.id,
  name: item.productVariant.product.name,
  price: toNumber(item.productVariant.price),
  image: item.productVariant.product.img?.[0]?.imageUrl || "",
  slug: item.productVariant.product.slug,
});

export const getWishlist = async (): Promise<WishlistProduct[]> => {
  const response = await apiRequest.get<WishlistResponse>("/wishlist");
  return response.data.map(mapWishlistItem);
};

export const addToWishlist = async (productVariantId: string): Promise<WishlistProduct> => {
  const response = await apiRequest.post<AddWishlistResponse>("/wishlist/add", {
    productVariantId,
  });
  return mapWishlistItem(response.data);
};

export const removeFromWishlist = async (productVariantId: string): Promise<void> => {
  await apiRequest.delete<RemoveWishlistResponse>("/wishlist/remove", {
    body: { productVariantId },
  });
};

export const checkWishlist = async (productVariantId: string): Promise<boolean> => {
  const response = await apiRequest.get<CheckWishlistResponse>(`/wishlist/check/${productVariantId}`);
  return response.data.isInWishlist;
};
