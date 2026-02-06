"use client";

import { useState } from "react";

export default function ProductFilter() {
   const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
   const [priceRange, setPriceRange] = useState<[number, number]>([
      0, 50000000,
   ]);
   const [selectedOS, setSelectedOS] = useState<string>("all");

   const brands = [
      { id: "apple", name: "Apple", logo: "🍎" },
      { id: "samsung", name: "Samsung", logo: "📱" },
      { id: "xiaomi", name: "Xiaomi", logo: "📱" },
      { id: "oppo", name: "OPPO", logo: "📱" },
      { id: "vivo", name: "Vivo", logo: "📱" },
      { id: "realme", name: "realme", logo: "📱" },
   ];

   const priceOptions = [
      { label: "Tất cả", value: "all" },
      { label: "Dưới 2 triệu", value: "0-2000000" },
      { label: "Từ 2 - 4 triệu", value: "2000000-4000000" },
      { label: "Từ 4 - 7 triệu", value: "4000000-7000000" },
      { label: "Từ 7 - 13 triệu", value: "7000000-13000000" },
      { label: "Từ 13 - 20 triệu", value: "13000000-20000000" },
      { label: "Trên 20 triệu", value: "20000000-50000000" },
   ];

   const toggleBrand = (brandId: string) => {
      setSelectedBrand((prev) =>
         prev.includes(brandId)
            ? prev.filter((id) => id !== brandId)
            : [...prev, brandId],
      );
   };

   return (
      <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">☰ Bộ lọc tìm kiếm</h3>
         </div>

         {/* Hãng sản xuất */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Hãng sản xuất</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="grid grid-cols-2 gap-2 mt-2">
               {brands.map((brand) => (
                  <button
                     key={brand.id}
                     onClick={() => toggleBrand(brand.id)}
                     className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        selectedBrand.includes(brand.id)
                           ? "border-blue-500 bg-blue-50 text-blue-700"
                           : "border-gray-200 hover:border-gray-300"
                     }`}
                  >
                     <span className="mr-1">{brand.logo}</span>
                     {brand.name}
                  </button>
               ))}
            </div>
            <button className="text-blue-600 text-sm mt-2 hover:underline">
               Xem thêm
            </button>
         </div>

         {/* Mức giá */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Mức giá</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="space-y-2 mt-2">
               {priceOptions.map((option) => (
                  <label
                     key={option.value}
                     className="flex items-center space-x-2 cursor-pointer"
                  >
                     <input
                        type="radio"
                        name="price"
                        value={option.value}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                     />
                     <span className="text-sm">{option.label}</span>
                  </label>
               ))}
            </div>
         </div>

         {/* Khoảng giá slider */}
         <div className="mb-6">
            <p className="font-medium mb-3">
               Hoặc nhập khoảng giá phù hợp với bạn:
            </p>
            <div className="flex items-center gap-2 mb-3">
               <input
                  type="text"
                  value={priceRange[0].toLocaleString("vi-VN")}
                  className="w-24 px-2 py-1 text-sm border rounded"
                  readOnly
               />
               <span>~</span>
               <input
                  type="text"
                  value={priceRange[1].toLocaleString("vi-VN")}
                  className="w-24 px-2 py-1 text-sm border rounded"
                  readOnly
               />
            </div>
            <input
               type="range"
               min="0"
               max="50000000"
               step="100000"
               value={priceRange[1]}
               onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
               }
               className="w-full accent-blue-600"
            />
         </div>

         {/* Hệ điều hành */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Hệ điều hành</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="flex gap-2 mt-2">
               <button
                  onClick={() => setSelectedOS("ios")}
                  className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                     selectedOS === "ios"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
               >
                  iOS
               </button>
               <button
                  onClick={() => setSelectedOS("android")}
                  className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                     selectedOS === "android"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
               >
                  Android
               </button>
            </div>
         </div>

         {/* Dung lượng ROM */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Dung lượng ROM</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
               {["≤128 GB", "256 GB", "512 GB", "1 TB"].map((storage) => (
                  <button
                     key={storage}
                     className="py-2 px-3 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  >
                     {storage}
                  </button>
               ))}
            </div>
         </div>

         {/* Kết nối */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Kết nối</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="flex flex-wrap gap-2 mt-2">
               {["NFC", "Bluetooth", "Hồng ngoại"].map((connection) => (
                  <button
                     key={connection}
                     className="py-2 px-3 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  >
                     {connection}
                  </button>
               ))}
            </div>
         </div>

         {/* Hiệu năng và Pin */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Hiệu năng và Pin</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="space-y-2 mt-2">
               {[
                  "Tất cả",
                  "Dưới 3000 mAh",
                  "Pin từ 3000 - 4000 mAh",
                  "Pin từ 4000 - 5500 mAh",
                  "Pin trâu: trên 5500 mAh",
               ].map((option) => (
                  <label
                     key={option}
                     className="flex items-center space-x-2 cursor-pointer"
                  >
                     <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 accent-blue-600 rounded"
                     />
                     <span className="text-sm">{option}</span>
                  </label>
               ))}
            </div>
         </div>

         {/* Hỗ trợ mạng */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>Hỗ trợ mạng</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="flex gap-2 mt-2">
               {["5G", "4G"].map((network) => (
                  <button
                     key={network}
                     className="py-2 px-4 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                  >
                     {network}
                  </button>
               ))}
            </div>
         </div>

         {/* RAM */}
         <div className="mb-6">
            <button className="flex items-center justify-between w-full py-3 font-medium text-gray-900">
               <span>RAM</span>
               <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={2}
                     d="M19 9l-7 7-7-7"
                  />
               </svg>
            </button>
            <div className="grid grid-cols-3 gap-2 mt-2">
               {["16 GB", "12 GB", "8 GB", "6 GB", "4 GB", "3 GB"].map(
                  (ram) => (
                     <button
                        key={ram}
                        className="py-2 px-3 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
                     >
                        {ram}
                     </button>
                  ),
               )}
            </div>
         </div>
      </div>
   );
}
