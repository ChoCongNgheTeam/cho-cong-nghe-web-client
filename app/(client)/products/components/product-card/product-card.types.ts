export interface ProductFeature {
  icon: string;
  label: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  features?: ProductFeature[];
  colors?: string[];
}