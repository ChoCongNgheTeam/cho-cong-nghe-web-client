export type Brand = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent: Category;
};

export type Inventory = {
  quantity: number;
  reservedQuantity: number;
  available: number;
};

export type ProductImage = {
  id: string;
  imageUrl: string;
  altText: string;
  position: number;
};

export type OptionValue = {
  id: string;
  value: string;
  label: string;
  variantIds: string[];
};

export type ProductOption = {
  type: "color" | "storage" | string;
  values: OptionValue[];
};

export type PriceRange = {
  min: number;
  max: number;
};

export type CurrentVariant = {
  id: string;
  code: string;
  price: number;
  soldCount: number;
  isDefault: boolean;
  isActive: boolean;
  available: boolean;
  stockStatus: "in_stock" | "out_of_stock";
  inventory: Inventory;
  images: ProductImage[];
  quantity: number;
};

export type Rating = {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type Highlight = {
  id: string;
  key: string;
  name: string;
  icon: string;
  unit: string | null;
  value: string;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: Brand;
  category: Category;
  availableOptions: ProductOption[];
  priceRange: PriceRange;
  warranty: string;
  stockStatus: "in_stock" | "out_of_stock" | string;
  currentVariant: CurrentVariant;
  rating: Rating;
  viewsCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  highlights: Highlight[];
  canReview: boolean;
  orderItemId: string | null;
  highlightGroups?: SpecificationGroup[];
  price: Price;
  availablePromotions?: Promotion[];
};

export type Price = {
  base: number;
  final: number;
  discountPercentage: number;
  hasPromotion: boolean;
};

export type ProductDetailResponse = {
  success: boolean;
  data: ProductDetail;
  message: string;
};

export interface SpecificationItem {
  id: string;
  key: string;
  name: string;
  icon: string;
  unit: string | null;
  value: string;
}

export type Promotion = {
  id: string;
  name: string;
  description: string;
  actionType: string;
  buyQuantity: number | null;
  getQuantity: number | null;
  discountValue: number;
};

export interface SpecificationGroup {
  groupName: string;
  items: SpecificationItem[];
}

export interface SpecificationsData {
  name: string;
  image: string;
  specifications: SpecificationGroup[];
}
