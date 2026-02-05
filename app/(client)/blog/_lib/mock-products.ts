export type RelatedProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: 1,
    name: "OPPO Reno15 5G 12GB",
    price: 10990000,
    image: "https://picsum.photos/120/160?1",
  },
  {
    id: 2,
    name: "Xiaomi Redmi Note 15 6GB",
    price: 4990000,
    image: "https://picsum.photos/120/160?2",
  },
  {
    id: 3,
    name: "Honor X9d 5G 8GB",
    price: 6990000,
    image: "https://picsum.photos/120/160?3",
  },
  {
    id: 4,
    name: "RedMagic 11 Pro 5G 12GB",
    price: 15990000,
    image: "https://picsum.photos/120/160?4",
  },
];
