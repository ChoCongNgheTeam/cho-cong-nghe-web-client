"use client";

import { categories } from "@/data/categories";

export default function FeaturedCategories() {
   // Lấy 16 danh mục nổi bật đầu tiên
   const featuredCategories = categories.slice(0, 16);

   return (
      <section className="py-8 bg-white mb-6 rounded-lg shadow-sm">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
               Danh mục nổi bật
            </h2>

            {/* MOBILE SCROLL */}
            <div className="block lg:hidden overflow-x-auto scrollbar-hide -mx-2 px-2">
               <div className="flex gap-4">
                  {featuredCategories.map((cat) => (
                     <div
                        key={cat.id}
                        className="
                  flex flex-col items-center justify-center
                  bg-gray-50 hover:bg-gray-100
                  rounded-lg p-4
                  cursor-pointer
                  transition
                  min-w-25
                "
                     >
                        <span className="text-4xl mb-2">{cat.icon}</span>
                        <span className="text-xs sm:text-sm text-center">
                           {cat.name}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* DESKTOP GRID */}
            <div className="hidden lg:grid lg:grid-cols-8 lg:gap-4">
               {featuredCategories.map((cat) => (
                  <div
                     key={cat.id}
                     className="
                flex flex-col items-center justify-center
                bg-gray-50 hover:bg-gray-100
                rounded-lg p-4
                cursor-pointer
                transition
              "
                  >
                     <span className="text-4xl mb-2">{cat.icon}</span>
                     <span className="text-xs sm:text-sm text-center">
                        {cat.name}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
