import React, { useState, useEffect, JSX } from "react";
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
   X,
   ChevronLeft,
} from "lucide-react";
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

interface CategoryGroup {
   title: string;
   icon: JSX.Element;
   categories: Category[];
}

interface GroupRow {
   sectionTitle: string;
   icon: JSX.Element;
   categories: Category[]; // Multiple categories in one row
}

const CategoryMegaMenu = () => {
   const [categories, setCategories] = useState<Category[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [hoveredCategories, setHoveredCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);

   // Mobile states
   const [mobileView, setMobileView] = useState<"main" | "subcategory">("main");
   const [mobileSelectedCategory, setMobileSelectedCategory] =
      useState<Category | null>(null);

   useEffect(() => {
      fetchCategories();
   }, []);

   useEffect(() => {
      if (isOpen) {
         const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

         document.body.style.paddingRight = `${scrollbarWidth}px`;
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
         // Reset mobile view when closing
         setMobileView("main");
         setMobileSelectedCategory(null);
      }

      return () => {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   const fetchCategories = async () => {
      try {
         const response = await fetch(
            "http://localhost:5000/api/v1/categories/tree",
         );
         const result: ApiResponse = await response.json();
         setCategories(result.data);
         setLoading(false);
         if (result.data[0]) {
            setHoveredCategories([result.data[0]]);
         }
      } catch (error) {
         console.error("Error fetching categories:", error);
         setLoading(false);
      }
   };

   // Get icon for level 1 categories
   const getLevel1Icon = (slug: string) => {
      const iconMap: Record<string, JSX.Element> = {
         "dien-thoai": <Smartphone className="w-5 h-5" />,
         laptop: <Laptop className="w-5 h-5" />,
         "dien-may": <Tv className="w-5 h-5" />,
         "phu-kien": <Headphones className="w-5 h-5" />,
         "cong-nghe-thiet-bi-so": <Settings className="w-5 h-5" />,
         "cham-soc-nha-cua-suc-khoe": <Heart className="w-5 h-5" />,
         "thiet-bi-gia-dinh-dien-gia-dung": <Home className="w-5 h-5" />,
         "thiet-bi-nha-bep": <Utensils className="w-5 h-5" />,
         "ket-noi-tien-ich-giai-tri": <Wifi className="w-5 h-5" />,
      };
      return iconMap[slug] || <Package className="w-5 h-5" />;
   };

   // Define which categories should be single vs grouped
   const singleCategorySlugs = ["dien-thoai", "laptop", "dien-may", "phu-kien"];

   // Get icon for group rows
   const getGroupIcon = (slug: string) => {
      const iconMap: Record<string, JSX.Element> = {
         "dong-ho": <Tv className="w-5 h-5" />,
         "may-tinh-bang": <Smartphone className="w-5 h-5" />,
         pc: <Laptop className="w-5 h-5" />,
         "man-hinh": <Tv className="w-5 h-5" />,
         "linh-kien": <Settings className="w-5 h-5" />,
         "may-in": <Package className="w-5 h-5" />,
         "may-chieu": <Tv className="w-5 h-5" />,
         "phan-mem": <Package className="w-5 h-5" />,
      };
      return iconMap[slug] || <Package className="w-5 h-5" />;
   };

   // Build group rows - each row can contain multiple level 2 categories
   const buildGroupRows = (): { sectionTitle: string; rows: GroupRow[] }[] => {
      const sections: { sectionTitle: string; rows: GroupRow[] }[] = [];

      categories.forEach((level1Cat) => {
         if (
            !singleCategorySlugs.includes(level1Cat.slug) &&
            level1Cat.children?.length > 0
         ) {
            const rows: GroupRow[] = [];

            // Group level 2 categories into rows
            if (level1Cat.slug === "cong-nghe-thiet-bi-so") {
               const children = level1Cat.children;
               if (children.length >= 2) {
                  rows.push({
                     sectionTitle: level1Cat.name,
                     icon: getGroupIcon(children[0].slug),
                     categories: children.slice(0, 2),
                  });
               }
               if (children.length >= 5) {
                  rows.push({
                     sectionTitle: level1Cat.name,
                     icon: getGroupIcon(children[2].slug),
                     categories: children.slice(2, 5),
                  });
               }
               if (children.length > 5) {
                  rows.push({
                     sectionTitle: level1Cat.name,
                     icon: getGroupIcon(children[5].slug),
                     categories: children.slice(5),
                  });
               }
            } else {
               for (let i = 0; i < level1Cat.children.length; i += 2) {
                  const groupCategories = level1Cat.children.slice(i, i + 2);
                  rows.push({
                     sectionTitle: level1Cat.name,
                     icon: getGroupIcon(groupCategories[0].slug),
                     categories: groupCategories,
                  });
               }
            }

            if (rows.length > 0) {
               sections.push({
                  sectionTitle: level1Cat.name,
                  rows: rows,
               });
            }
         }
      });

      return sections;
   };

   const groupedSections = buildGroupRows();

   const getSingleCategories = () => {
      return categories.filter((cat) => singleCategorySlugs.includes(cat.slug));
   };

   const handleGroupRowHover = (row: GroupRow) => {
      setHoveredCategories(row.categories);
   };

   const handleSingleCategoryHover = (category: Category) => {
      setHoveredCategories([category]);
   };

   // Mobile handlers
   const handleMobileCategoryClick = (category: Category) => {
      setMobileSelectedCategory(category);
      setMobileView("subcategory");
   };

   const handleMobileBack = () => {
      setMobileView("main");
      setMobileSelectedCategory(null);
   };

   if (loading) {
      return (
         <button className="p-2 hover:bg-neutral-light rounded-lg cursor-pointer flex items-center gap-1 text-primary transition-colors">
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="hidden lg:inline">Danh mục</span>
         </button>
      );
   }

   return (
      <div>
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-neutral-light rounded-lg cursor-pointer flex items-center gap-1 text-primary transition-colors"
         >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="hidden lg:inline font-medium">Danh mục</span>
         </button>

         {isOpen && (
            <>
               {/* Overlay */}
               <div
                  className="fixed inset-0 bg-secondary-darker/20 z-40"
                  onClick={() => setIsOpen(false)}
               />

               {/* Custom Scrollbar Styles */}
               <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 2px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgb(var(--neutral-dark));
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgb(var(--neutral-dark-hover));
            }
          `}</style>

               {/* MOBILE VIEW - Full Screen Modal */}
               <div className="fixed inset-0 bg-neutral-light z-50 lg:hidden flex flex-col">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b border-neutral bg-neutral-light sticky top-0 z-10">
                     {mobileView === "subcategory" ? (
                        <button
                           onClick={handleMobileBack}
                           className="flex items-center gap-2 text-primary"
                        >
                           <ChevronLeft className="w-5 h-5" />
                           <span className="font-medium">Quay lại</span>
                        </button>
                     ) : (
                        <h2 className="text-lg font-bold text-primary">
                           Danh mục sản phẩm
                        </h2>
                     )}
                     <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-neutral-light rounded-lg transition-colors"
                     >
                        <X className="w-6 h-6 text-primary" />
                     </button>
                  </div>

                  {/* Mobile Content */}
                  <div className="flex-1 overflow-y-auto">
                     {mobileView === "main" ? (
                        // Main categories list
                        <div className="p-4 space-y-2">
                           {/* Single Categories */}
                           {getSingleCategories().map((category) => (
                              <Link
                                 href={`category/${category.slug}`}
                                 key={category.id}
                                 onClick={() =>
                                    handleMobileCategoryClick(category)
                                 }
                                 className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-neutral hover:border-accent transition-colors"
                              >
                                 <div className="flex items-center gap-3">
                                    {getLevel1Icon(category.slug)}
                                    <span className="font-medium text-primary">
                                       {category.name}
                                    </span>
                                 </div>
                                 <ChevronRight className="w-5 h-5 text-neutral-dark" />
                              </Link>
                           ))}

                           {/* Grouped Sections */}
                           {groupedSections.map((section, sectionIndex) => (
                              <div key={sectionIndex} className="mt-4">
                                 <h3 className="text-xs font-semibold text-secondary-normal uppercase tracking-wide px-2 mb-2">
                                    {section.sectionTitle}
                                 </h3>
                                 {section.rows.map((row, rowIndex) => (
                                    <button
                                       key={rowIndex}
                                       onClick={() => {
                                          setMobileSelectedCategory(
                                             row.categories[0],
                                          );
                                          setHoveredCategories(row.categories);
                                          setMobileView("subcategory");
                                       }}
                                       className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-neutral hover:border-accent transition-colors mb-2"
                                    >
                                       <div className="flex items-center gap-3 flex-1 min-w-0">
                                          {row.icon}
                                          <div className="flex flex-wrap items-center gap-1 text-sm text-left">
                                             {row.categories.map((cat, idx) => (
                                                <React.Fragment key={cat.id}>
                                                   <span className="font-medium text-primary">
                                                      {cat.name}
                                                   </span>
                                                   {idx <
                                                      row.categories.length -
                                                         1 && (
                                                      <span className="text-neutral-dark">
                                                         ,
                                                      </span>
                                                   )}
                                                </React.Fragment>
                                             ))}
                                          </div>
                                       </div>
                                       <ChevronRight className="w-5 h-5 text-neutral-dark flex-shrink-0 ml-2" />
                                    </button>
                                 ))}
                              </div>
                           ))}
                        </div>
                     ) : (
                        // Subcategory view
                        <div className="p-4">
                           {mobileSelectedCategory && (
                              <>
                                 {/* Category Header */}
                                 <div className="flex items-center gap-2 mb-6 p-4 bg-white rounded-lg border border-neutral">
                                    <Sparkles className="w-6 h-6 text-accent" />
                                    <h3 className="text-lg font-bold text-primary">
                                       {mobileSelectedCategory.name}
                                    </h3>
                                 </div>

                                 {/* Special Brands Section for Phones */}
                                 {mobileSelectedCategory.slug ===
                                    "dien-thoai" && (
                                    <div className="mb-6 p-4 bg-white rounded-lg border border-neutral">
                                       <h4 className="text-sm font-semibold text-secondary mb-3">
                                          Thương hiệu nổi bật
                                       </h4>
                                       <div className="grid grid-cols-2 gap-2">
                                          {mobileSelectedCategory.children
                                             ?.filter((child) =>
                                                [
                                                   "apple-iphone",
                                                   "samsung",
                                                   "xiaomi",
                                                   "oppo",
                                                   "honor",
                                                ].includes(child.slug),
                                             )
                                             .map((brand) => (
                                                <a
                                                   key={brand.id}
                                                   href={`/category/${brand.slug}`}
                                                   className="flex items-center gap-2 p-3 bg-neutral-light border border-neutral rounded-lg hover:border-accent transition-all text-sm font-medium text-primary"
                                                >
                                                   <Smartphone className="w-4 h-4" />
                                                   {brand.name.replace(
                                                      " (iPhone)",
                                                      "",
                                                   )}
                                                </a>
                                             ))}
                                       </div>
                                    </div>
                                 )}

                                 {/* Subcategories */}
                                 {hoveredCategories.length === 1 &&
                                 singleCategorySlugs.includes(
                                    hoveredCategories[0].slug,
                                 ) ? (
                                    // Single category layout
                                    <div className="space-y-4">
                                       {mobileSelectedCategory.children
                                          ?.filter(
                                             (child) =>
                                                child.slug !==
                                                   "theo-phan-khuc-gia" &&
                                                child.slug !== "theo-nhu-cau",
                                          )
                                          .map((level2Category) => (
                                             <div
                                                key={level2Category.id}
                                                className="p-4 bg-white rounded-lg border border-neutral"
                                             >
                                                <h4 className="font-semibold text-primary mb-3 flex items-center gap-1">
                                                   {level2Category.name}
                                                   <ChevronRight className="w-4 h-4" />
                                                </h4>
                                                {level2Category.children
                                                   ?.length > 0 && (
                                                   <div className="space-y-2">
                                                      {level2Category.children.map(
                                                         (level3Item) => (
                                                            <a
                                                               key={
                                                                  level3Item.id
                                                               }
                                                               href={`/category/${level3Item.slug}`}
                                                               className="block text-sm text-secondary hover:text-accent transition-colors py-1"
                                                            >
                                                               {level3Item.name}
                                                            </a>
                                                         ),
                                                      )}
                                                   </div>
                                                )}
                                             </div>
                                          ))}

                                       {/* Price Range Section */}
                                       {mobileSelectedCategory.children?.some(
                                          (c) =>
                                             c.slug === "theo-phan-khuc-gia",
                                       ) && (
                                          <div className="p-4 bg-white rounded-lg border border-neutral">
                                             <h4 className="font-semibold text-primary mb-3 flex items-center gap-1">
                                                Theo phân khúc giá
                                                <ChevronRight className="w-4 h-4" />
                                             </h4>
                                             <div className="grid grid-cols-2 gap-2">
                                                {mobileSelectedCategory.children
                                                   .find(
                                                      (c) =>
                                                         c.slug ===
                                                         "theo-phan-khuc-gia",
                                                   )
                                                   ?.children?.map((price) => (
                                                      <a
                                                         key={price.id}
                                                         href={`/category/${price.slug}`}
                                                         className="text-sm text-secondary hover:text-accent transition-colors py-1"
                                                      >
                                                         {price.name}
                                                      </a>
                                                   ))}
                                             </div>
                                          </div>
                                       )}

                                       {/* Theo nhu cầu Section */}
                                       {mobileSelectedCategory.children?.some(
                                          (c) => c.slug === "theo-nhu-cau",
                                       ) && (
                                          <div className="p-4 bg-white rounded-lg border border-neutral">
                                             <h4 className="font-semibold text-primary mb-3 flex items-center gap-1">
                                                Theo nhu cầu
                                                <ChevronRight className="w-4 h-4" />
                                             </h4>
                                             <div className="grid grid-cols-2 gap-2">
                                                {mobileSelectedCategory.children
                                                   .find(
                                                      (c) =>
                                                         c.slug ===
                                                         "theo-nhu-cau",
                                                   )
                                                   ?.children?.map((need) => (
                                                      <a
                                                         key={need.id}
                                                         href={`/category/${need.slug}`}
                                                         className="text-sm text-secondary hover:text-accent transition-colors py-1"
                                                      >
                                                         {need.name}
                                                      </a>
                                                   ))}
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 ) : (
                                    // Grouped categories layout
                                    <div className="space-y-4">
                                       {hoveredCategories.map((category) => (
                                          <div
                                             key={category.id}
                                             className="p-4 bg-white rounded-lg border border-neutral"
                                          >
                                             <h4 className="font-semibold text-primary mb-3 flex items-center gap-1">
                                                {category.name}
                                                <ChevronRight className="w-4 h-4" />
                                             </h4>
                                             {category.children?.length > 0 ? (
                                                <div className="space-y-2">
                                                   {category.children.map(
                                                      (child) => (
                                                         <a
                                                            key={child.id}
                                                            href={`/category/${child.slug}`}
                                                            className="block text-sm text-secondary hover:text-accent transition-colors py-1"
                                                         >
                                                            {child.name}
                                                         </a>
                                                      ),
                                                   )}
                                                </div>
                                             ) : (
                                                <p className="text-sm text-secondary-normal">
                                                   Chưa có danh mục con
                                                </p>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* DESKTOP VIEW - Mega Menu */}
               <div className="hidden lg:flex absolute left-0 top-full mt-2 rounded-lg shadow-2xl z-50 overflow-hidden">
                  {/* Left Sidebar */}
                  <div className="w-80 bg-neutral-light border-r border-neutral max-h-[600px] overflow-y-auto custom-scrollbar">
                     {/* Single Categories */}
                     {getSingleCategories().map((category) => (
                        <Link
                           href={`category/${category.slug}`}
                           key={category.id}
                           onMouseEnter={() =>
                              handleSingleCategoryHover(category)
                           }
                           className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all ${
                              hoveredCategories.length === 1 &&
                              hoveredCategories[0]?.id === category.id
                                 ? "bg-primary-light text-primary"
                                 : "hover:bg-primary-light text-secondary"
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              {getLevel1Icon(category.slug)}
                              <span className="font-medium text-sm">
                                 {category.name}
                              </span>
                           </div>
                           {category.children?.length > 0 && (
                              <ChevronRight className="w-4 h-4 text-neutral-dark" />
                           )}
                        </Link>
                     ))}

                     {/* Grouped Sections */}
                     {groupedSections.map((section, sectionIndex) => {
                        return (
                           <div key={sectionIndex}>
                              {/* Section Title */}
                              <div className="px-5 pt-4 pb-2">
                                 <span className="text-xs font-semibold text-secondary-normal uppercase tracking-wide">
                                    {section.sectionTitle}
                                 </span>
                              </div>

                              {/* Group Rows */}
                              {section.rows.map((row, rowIndex) => {
                                 const isRowHovered = hoveredCategories.some(
                                    (cat) =>
                                       row.categories.some(
                                          (rowCat) => rowCat.id === cat.id,
                                       ),
                                 );

                                 return (
                                    <div
                                       key={rowIndex}
                                       onMouseEnter={() =>
                                          handleGroupRowHover(row)
                                       }
                                       className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all ${
                                          isRowHovered
                                             ? "bg-primary-light text-primary"
                                             : "hover:bg-primary-light text-secondary"
                                       }`}
                                    >
                                       <div className="flex items-center gap-3 flex-1">
                                          {row.icon}
                                          <div className="flex flex-wrap items-center gap-1 text-sm">
                                             {row.categories.map((cat, idx) => (
                                                <React.Fragment key={cat.id}>
                                                   <a
                                                      href={`/category/${cat.slug}`}
                                                      onClick={(e) =>
                                                         e.stopPropagation()
                                                      }
                                                      className="font-medium hover:text-accent transition-colors"
                                                   >
                                                      {cat.name}
                                                   </a>
                                                   {idx <
                                                      row.categories.length -
                                                         1 && (
                                                      <span className="text-neutral-dark">
                                                         ,
                                                      </span>
                                                   )}
                                                </React.Fragment>
                                             ))}
                                          </div>
                                       </div>
                                       <ChevronRight className="w-4 h-4 text-neutral-dark flex-shrink-0" />
                                    </div>
                                 );
                              })}
                           </div>
                        );
                     })}
                  </div>

                  {/* Right Content - Level 2 & 3 Categories */}
                  <div className="w-[900px] p-6 bg-primary-light max-h-[600px] overflow-y-auto custom-scrollbar">
                     {hoveredCategories.length > 0 && (
                        <>
                           {/* Check if this is a single category or grouped categories */}
                           {hoveredCategories.length === 1 &&
                           singleCategorySlugs.includes(
                              hoveredCategories[0].slug,
                           ) ? (
                              // Single category view
                              <>
                                 {/* Header */}
                                 <div className="flex items-center gap-2 mb-6">
                                    <Sparkles className="w-6 h-6 text-accent" />
                                    <h3 className="text-xl font-bold text-primary">
                                       {hoveredCategories[0].name}
                                    </h3>
                                 </div>

                                 {hoveredCategories[0].children?.length > 0 && (
                                    <>
                                       {/* Special Section - Brands */}
                                       {hoveredCategories[0].slug ===
                                          "dien-thoai" && (
                                          <div className="mb-6 pb-6 border-b border-neutral">
                                             <h4 className="text-sm font-semibold text-secondary mb-4">
                                                Thương hiệu nổi bật
                                             </h4>
                                             <div className="flex gap-3 flex-wrap">
                                                {hoveredCategories[0].children
                                                   .filter((child) =>
                                                      [
                                                         "apple-iphone",
                                                         "samsung",
                                                         "xiaomi",
                                                         "oppo",
                                                         "honor",
                                                      ].includes(child.slug),
                                                   )
                                                   .map((brand) => (
                                                      <button
                                                         key={brand.id}
                                                         className="flex items-center gap-2 px-4 py-2 bg-neutral-light border border-neutral rounded-lg hover:border-accent hover:shadow-md transition-all text-sm font-medium text-primary"
                                                      >
                                                         <Smartphone className="w-4 h-4" />
                                                         {brand.name.replace(
                                                            " (iPhone)",
                                                            "",
                                                         )}
                                                      </button>
                                                   ))}
                                             </div>
                                          </div>
                                       )}

                                       {/* Main Grid */}
                                       <div className="grid grid-cols-3 gap-x-8 gap-y-6 mb-6">
                                          {hoveredCategories[0].children
                                             .filter(
                                                (child) =>
                                                   child.slug !==
                                                      "theo-phan-khuc-gia" &&
                                                   child.slug !==
                                                      "theo-nhu-cau",
                                             )
                                             .map((level2Category) => (
                                                <div key={level2Category.id}>
                                                   <h4 className="font-semibold text-primary mb-2.5 flex items-center gap-1 hover:text-accent cursor-pointer transition-colors text-sm group">
                                                      {level2Category.name}
                                                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                   </h4>

                                                   {level2Category.children
                                                      ?.length > 0 && (
                                                      <div className="space-y-1.5">
                                                         {level2Category.children.map(
                                                            (level3Item) => (
                                                               <a
                                                                  key={
                                                                     level3Item.id
                                                                  }
                                                                  href={`/category/${level3Item.slug}`}
                                                                  className="block text-sm text-secondary hover:text-accent transition-colors"
                                                               >
                                                                  {
                                                                     level3Item.name
                                                                  }
                                                               </a>
                                                            ),
                                                         )}
                                                      </div>
                                                   )}
                                                </div>
                                             ))}
                                       </div>

                                       {/* Price Range Section */}
                                       {hoveredCategories[0].children?.some(
                                          (c) =>
                                             c.slug === "theo-phan-khuc-gia",
                                       ) && (
                                          <div className="mt-6 pt-6 border-t border-neutral">
                                             <h4 className="font-semibold text-primary mb-3 flex items-center gap-1.5 text-sm group cursor-pointer hover:text-accent transition-colors">
                                                <span>Theo phân khúc giá</span>
                                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                             </h4>
                                             <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                                                {hoveredCategories[0].children
                                                   .find(
                                                      (c) =>
                                                         c.slug ===
                                                         "theo-phan-khuc-gia",
                                                   )
                                                   ?.children?.map((price) => (
                                                      <a
                                                         key={price.id}
                                                         href={`/category/${price.slug}`}
                                                         className="text-sm text-secondary hover:text-accent transition-colors"
                                                      >
                                                         {price.name}
                                                      </a>
                                                   ))}
                                             </div>
                                          </div>
                                       )}

                                       {/* Theo nhu cầu Section */}
                                       {hoveredCategories[0].children?.some(
                                          (c) => c.slug === "theo-nhu-cau",
                                       ) && (
                                          <div className="mt-6 pt-6 border-t border-neutral">
                                             <h4 className="font-semibold text-primary mb-3 flex items-center gap-1.5 text-sm group cursor-pointer hover:text-accent transition-colors">
                                                <span>Theo nhu cầu</span>
                                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                             </h4>
                                             <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                                                {hoveredCategories[0].children
                                                   .find(
                                                      (c) =>
                                                         c.slug ===
                                                         "theo-nhu-cau",
                                                   )
                                                   ?.children?.map((need) => (
                                                      <a
                                                         key={need.id}
                                                         href={`/category/${need.slug}`}
                                                         className="text-sm text-secondary hover:text-accent transition-colors"
                                                      >
                                                         {need.name}
                                                      </a>
                                                   ))}
                                             </div>
                                          </div>
                                       )}
                                    </>
                                 )}

                                 {/* Empty State */}
                                 {hoveredCategories[0].children?.length ===
                                    0 && (
                                    <div className="flex flex-col items-center justify-center h-64 text-secondary-normal">
                                       <Package className="w-16 h-16 mb-4" />
                                       <p className="text-sm">
                                          Chưa có danh mục con
                                       </p>
                                    </div>
                                 )}
                              </>
                           ) : (
                              // Grouped categories view
                              <>
                                 <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                                    {hoveredCategories.map((category) => (
                                       <div key={category.id}>
                                          <h4 className="font-semibold text-primary mb-2.5 flex items-center gap-1 hover:text-accent cursor-pointer transition-colors text-sm group">
                                             {category.name}
                                             <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                          </h4>

                                          {category.children?.length > 0 ? (
                                             <div className="space-y-1.5">
                                                {category.children.map(
                                                   (child) => (
                                                      <a
                                                         key={child.id}
                                                         href={`/category/${child.slug}`}
                                                         className="block text-sm text-secondary hover:text-accent transition-colors"
                                                      >
                                                         {child.name}
                                                      </a>
                                                   ),
                                                )}
                                             </div>
                                          ) : (
                                             <p className="text-sm text-secondary-normal">
                                                Chưa có danh mục con
                                             </p>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </>
                           )}
                        </>
                     )}
                  </div>
               </div>
            </>
         )}
      </div>
   );
};

export default CategoryMegaMenu;
