// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type VariantDisplayType = "SELECTOR" | "CARD";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD — list page (từ transformProductCard)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductCard {
   id: string;
   name: string;
   slug: string;
   priceOrigin: number;
   thumbnail: string;
   rating: { average: number; count: number };
   isFeatured: boolean;
   isNew?: boolean;
   highlights: Array<{
      key: string;
      name: string;
      icon?: string | null;
      value: string;
   }>;
   inStock: boolean;
   isActive: boolean;
   // Admin-only fields
   deletedAt?: string | null;
   deletedBy?: string | null;
   updatedAt?: string;
   createdAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT DETAIL — raw admin response từ getProductById (sau khi sửa BE)
// Khớp 100% với response thực tế của /products/admin/:id
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductBrand {
   id: string;
   name: string;
   slug: string;
   description?: string | null;
   imagePath?: string | null;
   imageUrl?: string | null;
   isFeatured: boolean;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
   deletedAt?: string | null;
   deletedBy?: string | null;
}

export interface ProductCategory {
   id: string;
   name: string;
   slug: string;
   parentId?: string | null;
   description?: string | null;
   imagePath?: string | null;
   imageUrl?: string | null;
   position?: number;
   isFeatured: boolean;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
   deletedAt?: string | null;
   deletedBy?: string | null;
   categorySpecifications?: any[];
}

export interface ColorImage {
   id: string;
   productId: string;
   color: string;
   imagePath: string;
   imageUrl: string | null;
   altText?: string | null;
   position: number;
   createdAt: string;
   updatedAt: string;
}

export interface AttributeOption {
   id: string;
   attributeId: string;
   value: string;
   label: string;
   attribute: {
      id: string;
      code: string;
      name: string;
      createdAt: string;
   };
}

export interface VariantAttribute {
   id: string;
   productVariantId: string;
   attributeOptionId: string;
   createdAt: string;
   attributeOption: AttributeOption;
}

export interface ProductVariant {
   id: string;
   productId: string;
   code: string | null;
   price: number;
   images: ColorImage[];
   quantity: number;
   soldCount: number;
   isDefault: boolean;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
   deletedAt?: string | null;
   deletedBy?: string | null;
   variantAttributes: VariantAttribute[];
}

export interface Specification {
   id: string;
   key: string;
   name: string;
   group: string;
   unit?: string | null;
   icon?: string | null;
   isFilterable: boolean;
   filterType?: string | null;
   isRequired: boolean;
   sortOrder: number;
   createdAt: string;
}

export interface ProductSpecification {
   productId: string;
   specificationId: string;
   value: string;
   sortOrder: number;
   isHighlight: boolean;
   specification: Specification;
}

export interface ProductDetail {
   id: string;
   brandId: string;
   categoryId: string;
   name: string;
   slug: string;
   description?: string | null;
   viewsCount: string | number; // BigInt serialize thành string
   currentVariant: ProductVariant;
   totalSoldCount: number;
   ratingAverage: number;
   ratingCount: number;
   isActive: boolean;
   isFeatured: boolean;
   variantDisplay: VariantDisplayType;
   createdAt: string;
   updatedAt: string;
   deletedAt?: string | null;
   deletedBy?: string | null;
   brand: ProductBrand;
   category: ProductCategory;
   img: ColorImage[];
   variants: ProductVariant[];
   productSpecifications: ProductSpecification[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductMeta {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
   statusCounts: { [key: string]: number };
}

export interface ProductsResponse {
   data: ProductCard[];
   meta: ProductMeta;
   message: string;
}

export interface ProductDetailResponse {
   data: ProductDetail;
   message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export interface GetProductsParams {
   page?: number;
   limit?: number;
   search?: string;
   brandId?: string;
   categoryId?: string;
   isActive?: boolean;
   isFeatured?: boolean;
   includeDeleted?: boolean;
   dateFrom?: string;
   dateTo?: string;
   sortBy?:
      | "createdAt"
      | "updatedAt"
      | "name"
      | "viewsCount"
      | "ratingAverage"
      | "totalSoldCount";
   sortOrder?: "asc" | "desc";
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — derived types dùng trong component
// ─────────────────────────────────────────────────────────────────────────────

/** Group ảnh theo màu */
export interface ColorGroup {
   color: string;
   images: ColorImage[];
}

/** Group specs theo group name */
export interface SpecGroup {
   groupName: string;
   items: ProductSpecification[];
}

interface BrandOption {
   id: string;
   name: string;
   slug: string;
}
interface CategoryOption {
   id: string;
   name: string;
   slug: string;
   parentId?: string | null;
}
interface AttrOption {
   id: string;
   value: string;
   label: string;
}
interface TemplateAttribute {
   id: string;
   code: string;
   name: string;
   isRequired: boolean;
   options: AttrOption[];
}
interface TemplateSpecItem {
   id: string;
   key: string;
   name: string;
   groupName: string;
   unit?: string | null;
   isRequired: boolean;
   isFilterable: boolean;
   sortOrder: number;
}
interface TemplateSpecGroup {
   groupName: string;
   items: TemplateSpecItem[];
}
interface CategoryTemplate {
   attributes: TemplateAttribute[];
   specifications: TemplateSpecGroup[];
}

interface VariantForm {
   _key: string;
   id?: string;
   code: string;
   price: string;
   quantity: string;
   isDefault: boolean;
   isActive: boolean;
   attributes: Record<string, string>; // attributeId → attributeOptionId
}

interface ExistingImage {
   id: string;
   url: string;
   toDelete: boolean;
}

interface ColorImageForm {
   _key: string;
   color: string;
   altText: string;
   files: File[];
   previews: string[];
   existingImages?: ExistingImage[];
}

interface SpecForm {
   specificationId: string;
   value: string;
   isHighlight: boolean;
   enabled: boolean;
}

interface SelectOption {
   value: string;
   label: string;
}
