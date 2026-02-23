// =====================================================
// API MOCK – ALIGNED WITH ERD
// PHIÊN BẢN HOÀN CHỈNH: Kết hợp ERD + Banner System
// =====================================================

// ==================== INTERFACE DEFINITIONS (FROM ERD) ====================

// Từ bảng products trong ERD
export interface Product {
   id: string;
   brand_id: string;
   category_id: string;
   name: string;
   description: string;
   slug: string;
   views_count: number;
   rating_average: number;
   rating_count: number;
   is_active: boolean;
   is_featured: boolean;
}

// Từ bảng products_variants trong ERD
export interface ProductVariant {
   id: string;
   product_id: string;
   code: string; // UNIQUE
   price: number;
   sold_count: number;
   quantity: number;
   is_default: boolean;
   is_active: boolean;
}

// Từ bảng product_color_images trong ERD
export interface ProductColorImage {
   id: string;
   product_id: string;
   color: string;
   imagePath: string;
   altText: string;
   position: number;
}

// Từ bảng brands trong ERD
export interface Brand {
   id: string;
   name: string;
   description: string;
   image_path: string;
   slug: string;
   is_active: boolean;
}

// Từ bảng categories trong ERD
export interface Category {
   id: string;
   name: string;
   parent_id?: string;
   description: string;
   image_path: string;
   slug: string;
   position: number;
   is_active: boolean;
}

// Từ bảng promotions trong ERD
export interface Promotion {
   id: string;
   name: string;
   description: string;
   priority: number;
   is_active: boolean;
   start_date: Date;
   end_date: Date;
   min_order_value: number;
   max_discount_value: number;
   usage_limit: number;
   used_count: number;
}

// Từ bảng promotion_targets trong ERD
export interface PromotionTarget {
   id: string;
   promotion_id: string;
   target_type: string;
   target_id: string;
   buy_quantity: number;
   get_quantity: number;
   action_type: "PERCENT" | "FIXED";
   discount_value: number;
   gift_product_variantid?: string;
}

// Banner DTO (giữ nguyên từ API cũ)
export interface BannerDTO {
   id: string;
   title: string;
   image_path: string;
   link_url: string;
   type: "main" | "hot" | "triple" | "double";
   position: number;
}

// Blog DTO (giữ nguyên từ API cũ)
export interface BlogDTO {
   id: string;
   title: string;
   slug: string;
   thumbnail: string;
   content: string;
   author: {
      id: string;
      full_name: string;
   };
   view_count: number;
   status: "PUBLISHED" | "DRAFT";
   created_at: Date;
}

// ==================== RESPONSE DTOs ====================

// DTO để trả về cho client (kết hợp nhiều bảng)
export interface ProductDTO {
   // Product info
   product: Product;
   // Default variant
   variant: ProductVariant;
   // Main image
   mainImage?: ProductColorImage;
   // Brand
   brand: Brand;
   // Category
   category: Category;
   // Active promotions
   activePromotions: PromotionTarget[];
   // Calculated values
   original_price: number;
   sale_price: number;
   discount_percentage?: number;
}

// Category DTO cho danh sách
export interface CategoryDTO {
   id: string;
   name: string;
   slug: string;
   image_path: string;
   parent_id?: string;
}

// Hot Product Response
export interface HotProductResponse {
   success: boolean;
   data: ProductDTO[];
   total: number;
}

// ==================== MOCK DATA (ALIGNED WITH ERD) ====================

// BRANDS (từ bảng brands)
const MOCK_BRANDS: Record<string, Brand> = {
   b1: {
      id: "b1",
      name: "Apple",
      description: "Technology company from USA",
      image_path:
         "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=200",
      slug: "apple",
      is_active: true,
   },
   b2: {
      id: "b2",
      name: "Samsung",
      description: "Electronics company from Korea",
      image_path:
         "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200",
      slug: "samsung",
      is_active: true,
   },
   b3: {
      id: "b3",
      name: "Xiaomi",
      description: "Technology company from China",
      image_path:
         "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200",
      slug: "xiaomi",
      is_active: true,
   },
   b4: {
      id: "b4",
      name: "Dell",
      description: "Computer company from USA",
      image_path:
         "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200",
      slug: "dell",
      is_active: true,
   },
   b5: {
      id: "b5",
      name: "ASUS",
      description: "Electronics company from Taiwan",
      image_path:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200",
      slug: "asus",
      is_active: true,
   },
   b6: {
      id: "b6",
      name: "Sony",
      description: "Electronics company from Japan",
      image_path:
         "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200",
      slug: "sony",
      is_active: true,
   },
   b7: {
      id: "b7",
      name: "LG",
      description: "Electronics company from Korea",
      image_path:
         "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200",
      slug: "lg",
      is_active: true,
   },
   b8: {
      id: "b8",
      name: "JBL",
      description: "Audio company from USA",
      image_path:
         "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200",
      slug: "jbl",
      is_active: true,
   },
};

// CATEGORIES (từ bảng categories) - 16 categories
const MOCK_CATEGORIES: Record<string, Category> = {
   c1: {
      id: "c1",
      name: "Điện thoại",
      slug: "dien-thoai",
      description: "Smartphone và điện thoại di động",
      image_path:
         "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
      position: 1,
      is_active: true,
   },
   c2: {
      id: "c2",
      name: "Laptop",
      slug: "laptop",
      description: "Máy tính xách tay",
      image_path:
         "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop",
      position: 2,
      is_active: true,
   },
   c3: {
      id: "c3",
      name: "Máy tính bảng",
      slug: "may-tinh-bang",
      description: "Tablet",
      image_path:
         "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop",
      position: 3,
      is_active: true,
   },
   c4: {
      id: "c4",
      name: "Tai nghe",
      slug: "tai-nghe",
      description: "Tai nghe và headphone",
      image_path:
         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
      position: 4,
      is_active: true,
   },
   c5: {
      id: "c5",
      name: "Đồng hồ thông minh",
      slug: "dong-ho-thong-minh",
      description: "Smart watch",
      image_path:
         "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
      position: 5,
      is_active: true,
   },
   c6: {
      id: "c6",
      name: "Màn hình",
      slug: "man-hinh",
      description: "Monitor",
      image_path:
         "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop",
      position: 6,
      is_active: true,
   },
   c7: {
      id: "c7",
      name: "Loa",
      slug: "loa",
      description: "Speaker",
      image_path:
         "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop",
      position: 7,
      is_active: true,
   },
   c8: {
      id: "c8",
      name: "Camera",
      slug: "camera",
      description: "Máy ảnh",
      image_path:
         "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop",
      position: 8,
      is_active: true,
   },
   c9: {
      id: "c9",
      name: "Máy chiếu",
      slug: "may-chieu",
      description: "Projector",
      image_path:
         "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=200&fit=crop",
      position: 9,
      is_active: true,
   },
   c10: {
      id: "c10",
      name: "Tivi",
      slug: "tivi",
      description: "Television",
      image_path:
         "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop",
      position: 10,
      is_active: true,
   },
   c11: {
      id: "c11",
      name: "Máy giặt",
      slug: "may-giat",
      description: "Washing machine",
      image_path:
         "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=200&h=200&fit=crop",
      position: 11,
      is_active: true,
   },
   c12: {
      id: "c12",
      name: "Tủ lạnh",
      slug: "tu-lanh",
      description: "Refrigerator",
      image_path:
         "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=200&fit=crop",
      position: 12,
      is_active: true,
   },
   c13: {
      id: "c13",
      name: "Máy lọc nước",
      slug: "may-loc-nuoc",
      description: "Water purifier",
      image_path:
         "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop",
      position: 13,
      is_active: true,
   },
   c14: {
      id: "c14",
      name: "Máy sấy",
      slug: "may-say",
      description: "Dryer",
      image_path:
         "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&h=200&fit=crop",
      position: 14,
      is_active: true,
   },
   c15: {
      id: "c15",
      name: "Bàn phím",
      slug: "ban-phim",
      description: "Keyboard",
      image_path:
         "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop",
      position: 15,
      is_active: true,
   },
   c16: {
      id: "c16",
      name: "Chuột",
      slug: "chuot",
      description: "Mouse",
      image_path:
         "https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&h=200&fit=crop",
      position: 16,
      is_active: true,
   },
};

// PRODUCTS (từ bảng products)
const MOCK_PRODUCTS: Product[] = [
   // === ĐIỆN THOẠI ===
   {
      id: "p1",
      brand_id: "b1",
      category_id: "c1",
      name: "iPhone 15 Pro Max 256GB",
      description: "Flagship smartphone từ Apple với chip A17 Pro",
      slug: "iphone-15-pro-max-256gb",
      views_count: 15678,
      rating_average: 4.9,
      rating_count: 256,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p2",
      brand_id: "b2",
      category_id: "c1",
      name: "Samsung Galaxy S24 Ultra 512GB",
      description: "Flagship Android với S Pen",
      slug: "samsung-galaxy-s24-ultra-512gb",
      views_count: 12456,
      rating_average: 4.8,
      rating_count: 189,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p3",
      brand_id: "b3",
      category_id: "c1",
      name: "Xiaomi 14 Pro 256GB",
      description: "Flagship Xiaomi với camera Leica",
      slug: "xiaomi-14-pro-256gb",
      views_count: 9876,
      rating_average: 4.6,
      rating_count: 145,
      is_active: true,
      is_featured: true,
   },

   // === LAPTOP ===
   {
      id: "p4",
      brand_id: "b1",
      category_id: "c2",
      name: "MacBook Pro 14 M3 Pro 18GB/512GB",
      description: "Laptop cao cấp với chip M3 Pro",
      slug: "macbook-pro-14-m3-pro",
      views_count: 8765,
      rating_average: 4.9,
      rating_count: 98,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p5",
      brand_id: "b4",
      category_id: "c2",
      name: "Dell XPS 15 9530 i7/32GB/1TB",
      description: "Laptop Dell cao cấp cho creator",
      slug: "dell-xps-15-9530",
      views_count: 7654,
      rating_average: 4.7,
      rating_count: 76,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p6",
      brand_id: "b5",
      category_id: "c2",
      name: "ASUS ROG Zephyrus G14 RTX 4060",
      description: "Gaming laptop mỏng nhẹ",
      slug: "asus-rog-zephyrus-g14",
      views_count: 10234,
      rating_average: 4.8,
      rating_count: 112,
      is_active: true,
      is_featured: true,
   },

   // === MÁY TÍNH BẢNG ===
   {
      id: "p7",
      brand_id: "b1",
      category_id: "c3",
      name: "iPad Pro M2 11 inch 256GB WiFi",
      description: "Tablet cao cấp với chip M2",
      slug: "ipad-pro-m2-11-inch",
      views_count: 6543,
      rating_average: 4.8,
      rating_count: 134,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p8",
      brand_id: "b2",
      category_id: "c3",
      name: "Samsung Galaxy Tab S9+ 256GB",
      description: "Tablet Android cao cấp",
      slug: "samsung-galaxy-tab-s9-plus",
      views_count: 5432,
      rating_average: 4.6,
      rating_count: 89,
      is_active: true,
      is_featured: false,
   },

   // === TAI NGHE ===
   {
      id: "p9",
      brand_id: "b6",
      category_id: "c4",
      name: "Sony WH-1000XM5 Noise Cancelling",
      description: "Tai nghe chống ồn hàng đầu",
      slug: "sony-wh-1000xm5",
      views_count: 11234,
      rating_average: 4.9,
      rating_count: 278,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p10",
      brand_id: "b1",
      category_id: "c4",
      name: "AirPods Pro 2 USB-C",
      description: "Tai nghe true wireless từ Apple",
      slug: "airpods-pro-2-usb-c",
      views_count: 13456,
      rating_average: 4.7,
      rating_count: 456,
      is_active: true,
      is_featured: true,
   },

   // === ĐỒNG HỒ THÔNG MINH ===
   {
      id: "p11",
      brand_id: "b1",
      category_id: "c5",
      name: "Apple Watch Series 9 GPS 45mm",
      description: "Smartwatch từ Apple",
      slug: "apple-watch-series-9-45mm",
      views_count: 9876,
      rating_average: 4.8,
      rating_count: 203,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p12",
      brand_id: "b2",
      category_id: "c5",
      name: "Samsung Galaxy Watch 6 Classic 47mm",
      description: "Smartwatch Android cao cấp",
      slug: "samsung-galaxy-watch-6-classic",
      views_count: 7654,
      rating_average: 4.6,
      rating_count: 167,
      is_active: true,
      is_featured: false,
   },

   // === MÀN HÌNH ===
   {
      id: "p13",
      brand_id: "b7",
      category_id: "c6",
      name: "LG UltraGear 27GN950 4K 144Hz",
      description: "Gaming monitor 4K",
      slug: "lg-ultragear-27gn950",
      views_count: 5678,
      rating_average: 4.7,
      rating_count: 89,
      is_active: true,
      is_featured: true,
   },
   {
      id: "p14",
      brand_id: "b4",
      category_id: "c6",
      name: "Dell U2723DE 27 inch QHD IPS",
      description: "Monitor văn phòng cao cấp",
      slug: "dell-u2723de",
      views_count: 4567,
      rating_average: 4.6,
      rating_count: 54,
      is_active: true,
      is_featured: false,
   },

   // === LOA ===
   {
      id: "p15",
      brand_id: "b8",
      category_id: "c7",
      name: "JBL Charge 5 Portable Speaker",
      description: "Loa bluetooth di động",
      slug: "jbl-charge-5",
      views_count: 8901,
      rating_average: 4.7,
      rating_count: 312,
      is_active: true,
      is_featured: true,
   },
];

// PRODUCT VARIANTS (từ bảng products_variants)
const MOCK_VARIANTS: ProductVariant[] = [
   {
      id: "pv1",
      product_id: "p1",
      code: "IP15PM-256-TIT",
      price: 34990000,
      sold_count: 678,
      quantity: 8,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv2",
      product_id: "p2",
      code: "S24U-512-BLK",
      price: 29990000,
      sold_count: 543,
      quantity: 5,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv3",
      product_id: "p3",
      code: "X14P-256-BLK",
      price: 18990000,
      sold_count: 421,
      quantity: 7,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv4",
      product_id: "p4",
      code: "MBP14-M3P-512",
      price: 52990000,
      sold_count: 234,
      quantity: 4,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv5",
      product_id: "p5",
      code: "XPS15-I7-1TB",
      price: 45990000,
      sold_count: 189,
      quantity: 6,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv6",
      product_id: "p6",
      code: "G14-4060-1TB",
      price: 38990000,
      sold_count: 312,
      quantity: 9,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv7",
      product_id: "p7",
      code: "IPM2-11-256",
      price: 24990000,
      sold_count: 456,
      quantity: 10,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv8",
      product_id: "p8",
      code: "TABS9P-256",
      price: 19990000,
      sold_count: 267,
      quantity: 7,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv9",
      product_id: "p9",
      code: "WH1000XM5-BLK",
      price: 8990000,
      sold_count: 567,
      quantity: 15,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv10",
      product_id: "p10",
      code: "APP2-USBC",
      price: 6490000,
      sold_count: 892,
      quantity: 12,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv11",
      product_id: "p11",
      code: "AWS9-45-GPS",
      price: 11990000,
      sold_count: 445,
      quantity: 8,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv12",
      product_id: "p12",
      code: "GW6C-47",
      price: 8990000,
      sold_count: 334,
      quantity: 6,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv13",
      product_id: "p13",
      code: "UG27-4K144",
      price: 16990000,
      sold_count: 223,
      quantity: 5,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv14",
      product_id: "p14",
      code: "U27-QHD",
      price: 12990000,
      sold_count: 178,
      quantity: 7,
      is_default: true,
      is_active: true,
   },
   {
      id: "pv15",
      product_id: "p15",
      code: "C5-BLK",
      price: 4590000,
      sold_count: 789,
      quantity: 20,
      is_default: true,
      is_active: true,
   },
];

// PRODUCT IMAGES (từ bảng product_color_images)
const MOCK_IMAGES: ProductColorImage[] = [
   {
      id: "img1",
      product_id: "p1",
      color: "Titanium",
      imagePath:
         "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/iphone_17_pro_max_silver_1_7b25d56e26.png",
      altText: "iPhone 15 Pro Max",
      position: 1,
   },
   {
      id: "img2",
      product_id: "p2",
      color: "Black",
      imagePath:
         "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/iphone_16_white_9eac5c03e3.png",
      altText: "Samsung S24 Ultra",
      position: 1,
   },
   {
      id: "img3",
      product_id: "p3",
      color: "Black",
      imagePath:
         "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/2022_4_25_637864946617759009_iphone-13-den-1.jpg",
      altText: "Xiaomi 14 Pro",
      position: 1,
   },
   {
      id: "img4",
      product_id: "p4",
      color: "Space Gray",
      imagePath:
         "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/macbook_pro_14_m5_2025_den_1_c0818fdf94.jpg",
      altText: "MacBook Pro M3",
      position: 1,
   },
   {
      id: "img5",
      product_id: "p5",
      color: "Silver",
      imagePath:
         "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop",
      altText: "Dell XPS 15",
      position: 1,
   },
   {
      id: "img6",
      product_id: "p6",
      color: "Gray",
      imagePath:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&h=300&fit=crop",
      altText: "ASUS ROG G14",
      position: 1,
   },
   {
      id: "img7",
      product_id: "p7",
      color: "Silver",
      imagePath:
         "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop",
      altText: "iPad Pro M2",
      position: 1,
   },
   {
      id: "img8",
      product_id: "p8",
      color: "Gray",
      imagePath:
         "https://images.unsplash.com/photo-1585790050230-5dd28404f41a?w=300&h=300&fit=crop",
      altText: "Galaxy Tab S9+",
      position: 1,
   },
   {
      id: "img9",
      product_id: "p9",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop",
      altText: "Sony WH-1000XM5",
      position: 1,
   },
   {
      id: "img10",
      product_id: "p10",
      color: "White",
      imagePath:
         "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300&h=300&fit=crop",
      altText: "AirPods Pro 2",
      position: 1,
   },
   {
      id: "img11",
      product_id: "p11",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop",
      altText: "Apple Watch S9",
      position: 1,
   },
   {
      id: "img12",
      product_id: "p12",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&fit=crop",
      altText: "Galaxy Watch 6",
      position: 1,
   },
   {
      id: "img13",
      product_id: "p13",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop",
      altText: "LG UltraGear",
      position: 1,
   },
   {
      id: "img14",
      product_id: "p14",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=300&h=300&fit=crop",
      altText: "Dell U2723DE",
      position: 1,
   },
   {
      id: "img15",
      product_id: "p15",
      color: "Black",
      imagePath:
         "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
      altText: "JBL Charge 5",
      position: 1,
   },
];

// PROMOTIONS (từ bảng promotions)
const MOCK_PROMOTIONS: Promotion[] = [
   {
      id: "pr1",
      name: "Deal Tết Online Giá Chạm Đáy",
      description: "Khuyến mãi lớn nhất năm",
      priority: 1,
      is_active: true,
      start_date: new Date("2026-01-20"),
      end_date: new Date("2026-02-05"),
      min_order_value: 0,
      max_discount_value: 10000000,
      usage_limit: 10000,
      used_count: 2345,
   },
];

// PROMOTION TARGETS (từ bảng promotion_targets)
const MOCK_PROMOTION_TARGETS: PromotionTarget[] = [
   {
      id: "pt1",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv1",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 10,
   },
   {
      id: "pt2",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv2",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 3000000,
   },
   {
      id: "pt3",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv3",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 15,
   },
   {
      id: "pt4",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv4",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 5000000,
   },
   {
      id: "pt5",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv5",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 12,
   },
   {
      id: "pt6",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv6",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 4000000,
   },
   {
      id: "pt7",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv7",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 8,
   },
   {
      id: "pt8",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv8",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 2000000,
   },
   {
      id: "pt9",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv9",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 20,
   },
   {
      id: "pt10",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv10",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 1000000,
   },
   {
      id: "pt11",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv11",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 15,
   },
   {
      id: "pt12",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv12",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 1500000,
   },
   {
      id: "pt13",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv13",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 18,
   },
   {
      id: "pt14",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv14",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "FIXED",
      discount_value: 2000000,
   },
   {
      id: "pt15",
      promotion_id: "pr1",
      target_type: "PRODUCT_VARIANT",
      target_id: "pv15",
      buy_quantity: 1,
      get_quantity: 0,
      action_type: "PERCENT",
      discount_value: 25,
   },
];

// BANNERS (giữ nguyên từ API cũ)
const MOCK_BANNERS: BannerDTO[] = [
   // Main banners
   {
      id: "banner-main-1",
      title: "Tết Sale 2026",
      image_path:
         "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
      link_url: "/tet-sale",
      type: "main",
      position: 1,
   },
   {
      id: "banner-main-2",
      title: "Điện thoại giảm sốc",
      image_path:
         "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop",
      link_url: "/dien-thoai-sale",
      type: "main",
      position: 2,
   },
   {
      id: "banner-main-3",
      title: "Laptop mới 2026",
      image_path:
         "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=400&fit=crop",
      link_url: "/laptop-new",
      type: "main",
      position: 3,
   },

   // Double banners
   {
      id: "banner-double-1",
      title: "Smart Watch Sale",
      image_path:
         "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=300&fit=crop",
      link_url: "/smartwatch-sale",
      type: "double",
      position: 1,
   },
   {
      id: "banner-double-2",
      title: "Laptop Gaming Khuyến Mãi",
      image_path:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=300&fit=crop",
      link_url: "/laptop-gaming",
      type: "double",
      position: 2,
   },
   {
      id: "banner-double-3",
      title: "Laptop Gaming Khuyến Mãi",
      image_path:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=300&fit=crop",
      link_url: "/laptop-gaming",
      type: "double",
      position: 2,
   },
   {
      id: "banner-double-4",
      title: "Laptop Gaming Khuyến Mãi",
      image_path:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=300&fit=crop",
      link_url: "/laptop-gaming",
      type: "double",
      position: 2,
   },
   {
      id: "banner-double-5",
      title: "Laptop Gaming Khuyến Mãi",
      image_path:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=300&fit=crop",
      link_url: "/laptop-gaming",
      type: "double",
      position: 2,
   },

   // Hot banners
   {
      id: "banner-hot-1",
      title: "Hot Deal Hôm Nay",
      image_path:
         "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=600&fit=crop",
      link_url: "/hot-deals",
      type: "hot",
      position: 1,
   },
   {
      id: "banner-hot-2",
      title: "Giảm Giá Sập Sàn",
      image_path:
         "https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=400&h=600&fit=crop",
      link_url: "/flash-sale",
      type: "hot",
      position: 2,
   },

   // Triple banners
   {
      id: "banner-triple-1",
      title: "Phụ kiện giảm 50%",
      image_path:
         "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=200&fit=crop",
      link_url: "/phu-kien-sale",
      type: "triple",
      position: 1,
   },
   {
      id: "banner-triple-2",
      title: "Gia dụng khuyến mãi",
      image_path:
         "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=200&fit=crop",
      link_url: "/gia-dung-sale",
      type: "triple",
      position: 2,
   },
   {
      id: "banner-triple-3",
      title: "Tech Deal",
      image_path:
         "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=200&fit=crop",
      link_url: "/tech-deal",
      type: "triple",
      position: 3,
   },
];

// BLOGS (giữ nguyên từ API cũ)
const MOCK_BLOGS: BlogDTO[] = [
   {
      id: "blog1",
      title: "Top 10 Smartphone Flagship 2026",
      slug: "top-10-smartphone-flagship-2026",
      thumbnail:
         "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
      content: "Tổng hợp những chiếc điện thoại cao cấp nhất năm 2026...",
      author: { id: "u1", full_name: "Nguyễn Văn A" },
      view_count: 12450,
      status: "PUBLISHED",
      created_at: new Date("2026-01-15"),
   },
   {
      id: "blog2",
      title: "So sánh MacBook Pro M3 vs Dell XPS 15",
      slug: "so-sanh-macbook-pro-m3-vs-dell-xps-15",
      thumbnail:
         "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
      content: "Đâu là chiếc laptop phù hợp với bạn?...",
      author: { id: "u1", full_name: "Nguyễn Văn A" },
      view_count: 8930,
      status: "PUBLISHED",
      created_at: new Date("2026-01-20"),
   },
   {
      id: "blog3",
      title: "iPhone 17 Pro Max có gì mới? Đánh giá chi tiết",
      slug: "iphone-17-pro-max-co-gi-moi",
      thumbnail:
         "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=600&fit=crop",
      content:
         "Đánh giá thiết kế, hiệu năng và camera của iPhone 17 Pro Max...",
      author: { id: "u2", full_name: "Trần Minh Quân" },
      view_count: 15670,
      status: "PUBLISHED",
      created_at: new Date("2026-01-25"),
   },
   {
      id: "blog4",
      title: "Laptop gaming đáng mua nhất đầu năm 2026",
      slug: "laptop-gaming-dang-mua-nhat-2026",
      thumbnail:
         "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop",
      content: "Danh sách laptop gaming có hiệu năng tốt và giá hợp lý...",
      author: { id: "u3", full_name: "Lê Hoàng Long" },
      view_count: 10240,
      status: "PUBLISHED",
      created_at: new Date("2026-01-28"),
   },
   {
      id: "blog5",
      title: "Top tai nghe không dây chống ồn tốt nhất 2026",
      slug: "top-tai-nghe-khong-day-chong-on-2026",
      thumbnail:
         "https://images.unsplash.com/photo-1585386959984-a41552231693?w=800&h=600&fit=crop",
      content: "Sony, Apple hay Bose sẽ là lựa chọn tối ưu cho bạn?",
      author: { id: "u2", full_name: "Trần Minh Quân" },
      view_count: 7650,
      status: "PUBLISHED",
      created_at: new Date("2026-02-01"),
   },
   {
      id: "blog6",
      title: "Có nên mua MacBook Air M3 cho dân lập trình?",
      slug: "co-nen-mua-macbook-air-m3",
      thumbnail:
         "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
      content: "MacBook Air M3 có đủ mạnh cho lập trình và thiết kế?",
      author: { id: "u1", full_name: "Nguyễn Văn A" },
      view_count: 9320,
      status: "PUBLISHED",
      created_at: new Date("2026-02-03"),
   },
   {
      id: "blog7",
      title: "SSD NVMe Gen 5: Có thực sự cần thiết?",
      slug: "ssd-nvme-gen-5-co-can-thiet",
      thumbnail:
         "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=600&fit=crop",
      content: "Phân tích tốc độ, giá thành và nhu cầu sử dụng thực tế...",
      author: { id: "u4", full_name: "Phạm Quốc Bảo" },
      view_count: 5480,
      status: "PUBLISHED",
      created_at: new Date("2026-02-05"),
   },
   {
      id: "blog8",
      title: "So sánh Android 15 và iOS 19: Ai dẫn đầu?",
      slug: "so-sanh-android-15-va-ios-19",
      thumbnail:
         "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop",
      content: "Trải nghiệm người dùng, hiệu năng và bảo mật...",
      author: { id: "u3", full_name: "Lê Hoàng Long" },
      view_count: 11890,
      status: "PUBLISHED",
      created_at: new Date("2026-02-07"),
   },
   {
      id: "blog9",
      title: "Build PC đồ họa 30 triệu cho designer",
      slug: "build-pc-do-hoa-30-trieu",
      thumbnail:
         "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=600&fit=crop",
      content: "Cấu hình tối ưu cho Photoshop, Illustrator và Premiere...",
      author: { id: "u4", full_name: "Phạm Quốc Bảo" },
      view_count: 6840,
      status: "PUBLISHED",
      created_at: new Date("2026-02-10"),
   },
   {
      id: "blog10",
      title: "Smart Home 2026: Xu hướng và thiết bị nổi bật",
      slug: "smart-home-2026-xu-huong",
      thumbnail:
         "https://images.unsplash.com/photo-1581092334700-906bcc3a4c6c?w=800&h=600&fit=crop",
      content: "Những thiết bị thông minh giúp cuộc sống tiện nghi hơn...",
      author: { id: "u2", full_name: "Trần Minh Quân" },
      view_count: 4720,
      status: "PUBLISHED",
      created_at: new Date("2026-02-12"),
   },
   {
      id: "blog11",
      title: "Camera phone 2026: Ai mới là vua chụp ảnh?",
      slug: "camera-phone-2026",
      thumbnail:
         "https://images.unsplash.com/photo-1502920514313-52581002a659?w=800&h=600&fit=crop",
      content: "So sánh camera flagship từ Apple, Samsung và Xiaomi...",
      author: { id: "u1", full_name: "Nguyễn Văn A" },
      view_count: 13450,
      status: "PUBLISHED",
      created_at: new Date("2026-02-14"),
   },
   {
      id: "blog12",
      title: "Màn hình 4K hay 2K: Lựa chọn nào cho dân IT?",
      slug: "man-hinh-4k-hay-2k",
      thumbnail:
         "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      content: "Phân tích nhu cầu lập trình, gaming và thiết kế...",
      author: { id: "u3", full_name: "Lê Hoàng Long" },
      view_count: 5980,
      status: "PUBLISHED",
      created_at: new Date("2026-02-16"),
   },
];

// Mapping data cho banner-specific hot products
const BANNER_PRODUCT_MAPPING: Record<string, string[]> = {
   "banner-double-1": ["p11", "p12"], // Smart Watch
   "banner-double-2": ["p4", "p5", "p6"], // Laptop Gaming
   "banner-triple-1": ["p9", "p10"], // Audio
   "banner-triple-2": ["p13", "p14", "p15"], // Tech accessories
   "banner-triple-3": ["p7", "p8"], // Tablets
};

// ==================== HELPER FUNCTIONS ====================

function calculateSalePrice(
   originalPrice: number,
   target: PromotionTarget,
): number {
   if (target.action_type === "PERCENT") {
      return originalPrice * (1 - target.discount_value / 100);
   }
   return originalPrice - target.discount_value;
}

function getDiscountPercentage(
   originalPrice: number,
   salePrice: number,
): number {
   return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function buildProductDTO(product: Product): ProductDTO {
   const variant = MOCK_VARIANTS.find(
      (v) => v.product_id === product.id && v.is_default,
   );
   const mainImage = MOCK_IMAGES.find(
      (img) => img.product_id === product.id && img.position === 1,
   );
   const brand = MOCK_BRANDS[product.brand_id];
   const category = MOCK_CATEGORIES[product.category_id];

   if (!variant) {
      throw new Error(`No variant found for product ${product.id}`);
   }

   // Find active promotions for this variant
   const now = new Date();
   const activePromotionTargets = MOCK_PROMOTION_TARGETS.filter((pt) => {
      const promo = MOCK_PROMOTIONS.find((p) => p.id === pt.promotion_id);
      return (
         pt.target_id === variant.id &&
         promo &&
         promo.is_active &&
         promo.start_date <= now &&
         promo.end_date >= now
      );
   });

   const original_price = variant.price;
   let sale_price = original_price;
   let discount_percentage: number | undefined;

   // Apply first active promotion
   if (activePromotionTargets.length > 0) {
      const target = activePromotionTargets[0];
      sale_price = calculateSalePrice(original_price, target);
      discount_percentage = getDiscountPercentage(original_price, sale_price);
   }

   return {
      product,
      variant,
      mainImage,
      brand,
      category,
      activePromotions: activePromotionTargets,
      original_price,
      sale_price,
      discount_percentage,
   };
}

// ==================== API FUNCTIONS ====================

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Banner APIs
export async function getMainBanners(): Promise<BannerDTO[]> {
   await delay(200);
   return MOCK_BANNERS.filter((b) => b.type === "main");
}

export async function getDoubleBanners(): Promise<BannerDTO[]> {
   await delay(200);
   return MOCK_BANNERS.filter((b) => b.type === "double");
}

export async function getTripleBanners(): Promise<BannerDTO[]> {
   await delay(200);
   return MOCK_BANNERS.filter((b) => b.type === "triple");
}

// Category APIs
export async function getCategories(): Promise<CategoryDTO[]> {
   await delay(200);
   return Object.values(MOCK_CATEGORIES).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image_path: cat.image_path,
      parent_id: cat.parent_id,
   }));
}

// Product APIs
export async function getFeaturedProducts(): Promise<ProductDTO[]> {
   await delay(300);
   const featured = MOCK_PRODUCTS.filter((p) => p.is_featured);
   return featured.map(buildProductDTO);
}

export async function getHotProducts(): Promise<ProductDTO[]> {
   await delay(300);
   const hot = MOCK_PRODUCTS.filter((p) => p.rating_average >= 4.7);
   return hot.map(buildProductDTO);
}

export async function getSaleProducts(): Promise<ProductDTO[]> {
   await delay(300);
   const saleVariantIds = MOCK_PROMOTION_TARGETS.map((t) => t.target_id);
   const saleProducts = MOCK_PRODUCTS.filter((p) => {
      const variant = MOCK_VARIANTS.find(
         (v) => v.product_id === p.id && v.is_default,
      );
      return variant && saleVariantIds.includes(variant.id);
   });
   return saleProducts.map(buildProductDTO);
}

export async function getProductsByCategory(
   slug: string,
): Promise<ProductDTO[]> {
   await delay(300);
   const category = Object.values(MOCK_CATEGORIES).find((c) => c.slug === slug);
   if (!category) return [];

   const products = MOCK_PRODUCTS.filter((p) => p.category_id === category.id);
   return products.map(buildProductDTO);
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
   await delay(200);
   const product = MOCK_PRODUCTS.find((p) => p.id === id);
   if (!product) return null;
   return buildProductDTO(product);
}

// Hot Products by Banner - API MỚI
export async function getHotProductsByBanner(
   bannerId: string,
): Promise<HotProductResponse> {
   await delay(500);

   try {
      const productIds = BANNER_PRODUCT_MAPPING[bannerId] || [];
      const products = MOCK_PRODUCTS.filter((p) => productIds.includes(p.id));
      const productDTOs = products.map(buildProductDTO);

      return {
         success: true,
         data: productDTOs,
         total: productDTOs.length,
      };
   } catch (error) {
      console.error("Error fetching hot products by banner:", error);
      return {
         success: false,
         data: [],
         total: 0,
      };
   }
}

// Promotion APIs
export async function getActivePromotions(): Promise<Promotion[]> {
   await delay(200);
   const now = new Date();
   return MOCK_PROMOTIONS.filter(
      (p) => p.is_active && p.start_date <= now && p.end_date >= now,
   );
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
   await delay(200);
   return MOCK_PROMOTIONS.find((p) => p.id === id) || null;
}

// Blog APIs
export async function getBlogs(): Promise<BlogDTO[]> {
   await delay(200);
   return MOCK_BLOGS;
}

export async function getBlogById(id: string): Promise<BlogDTO | null> {
   await delay(200);
   return MOCK_BLOGS.find((b) => b.id === id) || null;
}

// ==================== UTILITY FUNCTIONS ====================

export function formatPrice(price: number): string {
   return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
   }).format(price);
}
