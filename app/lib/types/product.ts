/**
 * Định nghĩa các kiểu dữ liệu liên quan đến sản phẩm
 */
/** Thương hiệu */
export type Brand = {
  id: string;
  name: string;
};

/** Danh mục */
export type Category = {
  id: string;
  name: string;
  slug: string;
};

/** Sản phẩm trong danh mục */
export type ProductCategory = {
  category: Category;
  isPrimary: boolean;
};

/* Kho hàng */
export type Inventory = {
  quantity: number;
  reservedQuantity: number;
};

/* Hình ảnh sản phẩm */
export type ProductImage = {
  id: string;
  imageUrl: string;
  altText: string;
  position: number;
};

/* Thuốc tính sản phẩm */
export type Attribute = {
  id: string;
  name: string;
};

/* Tùy chọn thuộc tính */
export type AttributeOption = {
  id: string;
  value: string;
  attribute: Attribute;
};

export type VariantAttribute = {
  id: string;
  attributeOptionId: string;
  attributeOption: AttributeOption;
  createdAt: string;
};

/** Biến thể sản phẩm */
export type ProductVariant = {
  id: string;
  code: string;
  price: string;
  weight: string;
  isDefault: boolean;
  isActive: boolean;
  inventory: Inventory;
  images: ProductImage[];
  variantAttributes: VariantAttribute[];
};

/** Chi tiết sản phẩm */
export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  slug: string;

  brandId: string;
  brand: Brand;

  viewsCount: string;
  ratingAverage: string;
  ratingCount: number;

  isFeatured: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  productCategories: ProductCategory[];
  variants: ProductVariant[];

  highlights: any[]; // Chưa có cấu trúc cụ thể
};
