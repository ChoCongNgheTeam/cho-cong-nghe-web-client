import React, { useState, useEffect, useRef } from "react";
import {
   Menu,
   ChevronRight,
   Smartphone,
   Laptop,
   Tv,
   Headphones,
   Settings,
   Home,
   Heart,
   Utensils,
   Wifi,
   Package,
   Sparkles,
   Zap,
   Watch,
   Monitor,
   Apple,
} from "lucide-react";
import apiRequest from "@/lib/api";
import Link from "next/link";

interface Category {
   id: string;
   name: string;
   slug: string;
   parentId: string | null;
   position: number;
   children: Category[];
}

interface ApiResponse {
   data: Category[];
   message: string;
}

// Component: Brand Grid
const BrandGrid = ({ brands }: { brands: Category[] }) => {
   const brandIcons: Record<string, any> = {
      "apple-iphone": Apple,
      samsung: Zap,
      xiaomi: Sparkles,
      oppo: Smartphone,
      honor: Monitor,
   };

   return (
      <div className="mb-6">
         <h4 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-promotion" />
            Thương hiệu nổi bật
         </h4>
         <div className="grid grid-cols-5 gap-3">
            {brands.map((brand) => {
               const Icon = brandIcons[brand.slug] || Smartphone;
               return (
                  <Link
                     key={brand.id}
                     href={`/category/${brand.slug}`}
                     className="flex flex-col items-center gap-2 p-4 bg-neutral-light border border-neutral rounded-xl hover:border-accent hover:shadow-lg transition-all cursor-pointer group"
                  >
                     <div className="w-12 h-12 bg-neutral-light-active rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-primary" />
                     </div>
                     <span className="text-xs font-medium text-primary text-center">
                        {brand.name.replace(" (iPhone)", "")}
                     </span>
                  </Link>
               );
            })}
         </div>
      </div>
   );
};

// Component: Hot Items List
const HotItemList = ({
   items,
}: {
   items: { name: string; badge?: string }[];
}) => {
   return (
      <div className="mb-6">
         <h4 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-promotion" />
            Sản phẩm HOT
         </h4>
         <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
               <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-promotion border border-promotion rounded-full hover:shadow-md transition-all cursor-pointer group"
               >
                  <span className="text-sm font-medium text-neutral">
                     {item.name}
                  </span>
                  {item.badge && (
                     <span className="px-2 py-0.5 text-xs font-bold text-neutral-light bg-promotion rounded-full">
                        {item.badge}
                     </span>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
};

// Component: Price Range List
const PriceRangeList = ({
   priceCategories,
}: {
   priceCategories: Category[];
}) => {
   return (
      <div className="pt-6 border-t border-neutral">
         <h4 className="text-sm font-semibold text-primary-light mb-4 flex items-center gap-2">
            💰 Theo mức giá
         </h4>
         <div className="flex flex-wrap gap-2">
            {priceCategories.map((price) => (
               <div
                  key={price.id}
                  className="px-4 py-2 bg-neutral-light border border-neutral rounded-full hover:border-accent hover:bg-accent-light transition-all cursor-pointer"
               >
                  <span className="text-sm font-medium text-primary-light">
                     {price.name}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
};

// Component: Category List (Sidebar)
const CategoryList = ({
   categories,
   activeCategory,
   onHover,
}: {
   categories: Category[];
   activeCategory: Category | null;
   onHover: (category: Category) => void;
}) => {
   const getIcon = (slug: string) => {
      const icons: Record<string, any> = {
         "dien-thoai": Smartphone,
         laptop: Laptop,
         "dien-may": Tv,
         "phu-kien": Headphones,
         "cong-nghe-thiet-bi-so": Settings,
         "cham-soc-nha-cua-suc-khoe": Heart,
         "thiet-bi-gia-dinh-dien-gia-dung": Home,
         "thiet-bi-nha-bep": Utensils,
         "ket-noi-tien-ich-giai-tri": Wifi,
      };
      return icons[slug] || Package;
   };

   return (
      <div className="w-64 bg-neutral-light-active border-r border-neutral flex flex-col h-full overflow-y-auto">
         {categories.map((category) => {
            const Icon = getIcon(category.slug);
            const isActive = activeCategory?.id === category.id;

            return (
               <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onMouseEnter={() => onHover(category)}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all border-l-4 ${
                     isActive
                        ? "bg-neutral-light border-primary text-primary"
                        : "border-transparent hover:bg-neutral-light text-primary"
                  }`}
               >
                  <div className="flex items-center gap-3">
                     <Icon className="w-5 h-5" />
                     <span className="font-medium text-sm">
                        {category.name}
                     </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-dark" />
               </Link>
            );
         })}
         <div className="px-5 py-4 border-t border-neutral">
            {categories.slice(4).map((category) => {
               const Icon = getIcon(category.slug);
               const isActive = activeCategory?.id === category.id;

               return (
                  <div
                     key={category.id}
                     onMouseEnter={() => onHover(category)}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1 ${
                        isActive
                           ? "bg-accent-light text-accent"
                           : "hover:bg-neutral text-primary"
                     }`}
                  >
                     <Icon className="w-4 h-4" />
                     <span className="text-sm font-medium">
                        {category.name}
                     </span>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

// Component: Mega Panel
const MegaPanel = ({ category }: { category: Category | null }) => {
   if (!category) return null;

   const brands = category.children?.filter((child) =>
      ["apple-iphone", "samsung", "xiaomi", "oppo", "honor"].includes(
         child.slug,
      ),
   );

   const hotItems =
      category.slug === "dien-thoai"
         ? [
              { name: "iPhone 16 Series", badge: "HOT" },
              { name: "Galaxy S25", badge: "MỚI" },
              { name: "Xiaomi 15 Pro" },
              { name: "OPPO Find X8" },
              { name: "Điện thoại gập" },
           ]
         : [];

   const priceCategory = category.children?.find(
      (c) => c.slug === "theo-phan-khuc-gia",
   );

   const mainCategories = category.children?.filter(
      (child) =>
         child.slug !== "theo-phan-khuc-gia" && child.slug !== "theo-nhu-cau",
   );

   return (
      <div className="flex-1 bg-neutral-light p-8 overflow-y-auto custom-scrollbar h-full">
         {/* Header */}
         <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-linear-to-br from-accent to-accent-active rounded-xl flex items-center justify-center">
               <Sparkles className="w-6 h-6 text-neutral" />
            </div>
            <div>
               <h3 className="text-2xl font-bold text-primary">
                  {category.name}
               </h3>
               <p className="text-sm text-neutral-dark">
                  Khám phá sản phẩm tốt nhất
               </p>
            </div>
         </div>

         {brands && brands.length > 0 && <BrandGrid brands={brands} />}
         {hotItems.length > 0 && <HotItemList items={hotItems} />}

         {mainCategories && mainCategories.length > 0 && (
            <div className="grid grid-cols-4 gap-6 mb-6">
               {mainCategories.map((cat) => (
                  <div key={cat.id} className="space-y-2">
                     <Link
                        href={`/category/${cat.slug}`}
                        className="font-semibold text-primary text-sm flex items-center gap-1 group cursor-pointer hover:text-accent transition-colors"
                     >
                        {cat.name}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                     </Link>
                     {cat.children && cat.children.length > 0 && (
                        <div className="space-y-1.5">
                           {cat.children.slice(0, 5).map((subCat) => (
                              <Link
                                 key={subCat.id}
                                 href={`/category/${subCat.slug}`}
                                 className="block text-sm text-primary hover:text-accent transition-colors"
                              >
                                 {subCat.name}
                              </Link>
                           ))}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         )}

         {priceCategory && priceCategory.children && (
            <PriceRangeList priceCategories={priceCategory.children} />
         )}
      </div>
   );
};

// Main Component
export default function CategoryMegaMenu() {
   const [categories, setCategories] = useState<Category[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [activeCategory, setActiveCategory] = useState<Category | null>(null);
   const [loading, setLoading] = useState(true);
   const containerRef = useRef<HTMLDivElement>(null);
   const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(() => {
      fetchCategories();
   }, []);

   const fetchCategories = async () => {
      try {
         // Sử dụng apiRequest với noAuth=true vì endpoint công khai
         const result = await apiRequest.get<ApiResponse>("/categories/tree", {
            noAuth: true,
         });

         setCategories(result.data);
         if (result.data[0]) {
            setActiveCategory(result.data[0]);
         }
      } catch (error) {
         console.error("Error fetching categories:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleMouseEnter = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setIsOpen(true);
   };

   const handleMouseLeave = () => {
      // Delay nhỏ để tránh đóng khi di chuột giữa button và menu
      closeTimer.current = setTimeout(() => setIsOpen(false), 120);
   };

   if (loading) {
      return (
         <button className="p-2 hover:bg-neutral rounded-lg flex items-center gap-2">
            <Menu className="w-5 h-5" />
            <span className="text-sm">Đang tải...</span>
         </button>
      );
   }

   return (
      <div
         ref={containerRef}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
      >
         {/* Trigger Button */}
         <button
            className={[
               "p-2 rounded-lg flex items-center gap-2 transition-colors duration-150",
               isOpen ? "bg-neutral" : "hover:bg-neutral",
            ].join(" ")}
         >
            <Menu
               className={[
                  "w-5 h-5 transition-transform duration-200",
                  isOpen ? "rotate-90" : "rotate-0",
               ].join(" ")}
            />
            <span className="text-sm font-medium">Danh mục</span>
         </button>

         <div
            className={[
               "absolute left-0 top-full mt-2 flex rounded-2xl shadow-2xl z-50 overflow-hidden",
               "origin-top-left",
               "transition-[opacity,transform] duration-200 ease-out",
               isOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none",
            ].join(" ")}
            style={{ height: "520px", width: "1264px" }}
            onClick={() => setIsOpen(false)}
         >
            <CategoryList
               categories={categories}
               activeCategory={activeCategory}
               onHover={setActiveCategory}
            />
            <MegaPanel category={activeCategory} />
         </div>

         {/* Custom Scrollbar */}
         <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(var(--neutral-dark)); border-radius: 3px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgb(var(--neutral-dark-hover)); }
         `}</style>
      </div>
   );
}
