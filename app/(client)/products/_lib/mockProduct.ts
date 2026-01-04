// Mock product data according to YOUR ERD (Phone product)
export const mockProduct = {
  /* =========================
     PRODUCT (products)
  ========================= */
  id: "prod_iphone_15",
  slug: "iphone-15-pro-max",
  name: "iPhone 15 Pro Max",
  description:
    "iPhone 15 Pro Max với chip A17 Pro, khung titanium siêu nhẹ, camera 48MP và thời lượng pin vượt trội.",
  rating_average: 4.8,
  ratingCount: 1240,
  views_count: 18234,
  isActive: true,
  isFeatured: true,

  /* =========================
     CATEGORIES (categories + product_categories)
  ========================= */
  categories: [
    {
      id: "cat_phone",
      parentId: "cat_tech",
      name: "Điện thoại",
      slug: "dien-thoai",
      description: "Điện thoại thông minh",
      position: 1,
      isActive: true,
    },
  ],

  /* =========================
     HIGHLIGHTS (highlights + product_highlights)
  ========================= */
  highlights: [
    {
      id: "hl_001",
      title: "Chip A17 Pro",
      value: "3nm",
      sort_order: 1,
    },
    {
      id: "hl_002",
      title: "Camera chính",
      value: "48MP",
      sort_order: 2,
    },
    {
      id: "hl_003",
      title: "Khung viền",
      value: "Titanium",
      sort_order: 3,
    },
  ],

  /* =========================
     VARIANTS (products_variants)
  ========================= */
  variants: [
    {
      id: "var_iphone_256_black",
      productId: "prod_iphone_15",
      code: "IP15PM-256-BLK",
      price: 34990000,
      weight: 0.221,
      isDefault: true,
      isActive: true,

      /* =========================
         VARIANT ATTRIBUTES
         (attributes + attributes_options + variants_attributes)
      ========================= */
      attributes: [
        { name: "Màu sắc", value: ["Đen ", "Xanh ", "Trắng "] },
        { name: "RAM", value: "8GB" },
        { name: "Bộ nhớ trong", value: "256 GB" },
      ],

      /* =========================
         INVENTORY (inventory)
      ========================= */
      inventory: {
        quantity: 120,
        reservedQuantity: 15,
        availableQuantity: 105, // computed, NOT stored in DB
      },

      /* =========================
         VARIANT IMAGES (product_variant_images)
      ========================= */
      images: [
        {
          id: "img_001",
          productVariantId: "var_iphone_256_black",
          thumbnail:
            "https://cdn2.fptshop.com.vn/unsafe/400x300/filters:format(webp)/nubia_a76_den_5_26e8fd922b.jpg",
          imgUrl: [
            "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/nubia_a76_den_5_26e8fd922b.jpg",
            "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/nubia_a76_den_5_26e8fd922b.jpg",
          ],

          altText: "iPhone 15 Pro Max Đen Titanium",
          position: 1,
        },
      ],
    },

    {
      id: "var_iphone_512_blue",
      productId: "prod_iphone_15",
      code: "IP15PM-512-BLU",
      price: 38990000,
      weight: 0.221,
      isDefault: false,
      isActive: true,

      attributes: [
        { name: "Màu sắc", value: "Xanh Titanium" },
        { name: "RAM", value: "8GB" },
        { name: "Bộ nhớ trong", value: "512GB" },
      ],

      inventory: {
        quantity: 80,
        reservedQuantity: 10,
        availableQuantity: 70,
      },

      images: [
        {
          id: "img_002",
          productVariantId: "var_iphone_512_blue",
          imgUrl:
            "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/nubia_a76_den_1_734bd59948.jpg",
          altText: "iPhone 15 Pro Max Xanh Titanium",
          position: 1,
        },
      ],
    },
  ],

  /* =========================
     PAYMENTS (payment_methods)
  ========================= */
  payments: [
    {
      id: "pay_bank_scb",
      code: "SCB",
      name: "Ngân hàng SCB",
      logo: "https://cdn2.fptshop.com.vn/promotion/unsafe/1920x0/filters:format(webp):quality(75)/images-promotion/logo-scb-1760973429023.png",
      type: "BANK",
      isActive: true,
      description: "Giảm ngay 500,000đ cho đơn từ 8 triệu khi thanh",
      position: 1,
    },
    {
      id: "pay_bank_tcb",
      code: "TECHCOMBANK",
      name: "Techcombank",
      logo: "https://cdn2.fptshop.com.vn/promotion/unsafe/1920x0/filters:format(webp):quality(75)/images-promotion/logo-techcombank-inkythuatso-10-15-11-46-1753758027837.jpeg",
      type: "BANK",
      isActive: true,
      description:
        "Giảm ngay 500,000đ cho đơn từ 8 triệu khi thanh toán 2342423.",
      position: 2,
    },
    {
      id: "pay_vnpay",
      code: "VNPAY",
      name: "Ví điện tử VNPAY",
      logo: "https://cdn2.fptshop.com.vn/promotion/unsafe/1920x0/filters:format(webp):quality(75)/images-promotion/logo-MB-Bank-1763574839734.jpeg",
      type: "EWALLET",
      isActive: true,
      position: 3,
      description:
        "Giảm ngay 500,000đ cho đơn từ 8 triệu khi thanh toán qua thẻ Visa SCB.",
      isDefault: true, // 👈 mặc định hiển thị đầu tiên
    },
    {
      id: "pay_mb",
      code: "MB",
      name: "Ngân hàng Quân Đội (MB)",
      logo: "https://cdn2.fptshop.com.vn/promotion/unsafe/1920x0/filters:format(webp):quality(75)/images-promotion/logo-visa-1744348654364.png",
      type: "BANK",
      isActive: true,
      description:
        "Giảm ngay 500,000đ cho đơn từ 8 triệu khi thanh toán qua thẻ Visa SCB.",
      position: 4,
    },
    {
      id: "pay_visa",
      code: "VISA",
      name: "Thanh toán bằng thẻ Visa",
      logo: "https://cdn2.fptshop.com.vn/promotion/unsafe/1920x0/filters:format(webp):quality(75)/images-promotion/logo-Kredivo-1744348489666.png",
      type: "CARD",
      isActive: true,
      description:
        "Giảm ngay 500,000đ cho đơn từ 8 triệu khi thanh toán qua thẻ Visa SCB.",
      position: 5,
    },
  ],
};

export type ProductAttribute = {
  name: string;
  value: string | string[];
};

export type ProductInventory = {
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // computed
};

export type ProductVariantImage = {
  id: string;
  productVariantId: string;
  imgUrl: string | string[];
  altText: string;
  position: number;
};

export type ProductVariant = {
  id: string;
  productId: string;
  code: string;
  price: number;
  weight: number;
  isDefault: boolean;
  isActive: boolean;
  attributes: ProductAttribute[];
  inventory: ProductInventory;
  images: ProductVariantImage[];
};

export type ProductCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string;
  position: number;
  isActive: boolean;
};

export type ProductHighlight = {
  id: string;
  title: string;
  value: string;
  sort_order: number;
};

export type PaymentMethod = {
  id: string;
  code: string;
  name: string;
  logo: string;
  type: string;
  isActive: boolean;
  position: number;
  isDefault?: boolean;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  rating_average: number;
  ratingCount: number;
  views_count: number;
  isActive: boolean;
  isFeatured: boolean;
  categories: ProductCategory[];
  highlights: ProductHighlight[];
  variants: ProductVariant[];
  payments?: PaymentMethod[];
};
