"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export default function ProductFilter() {
   const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
   const [selectedOS, setSelectedOS] = useState<string>("all");
   const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
   const [selectedNetwork, setSelectedNetwork] = useState<string[]>([]);
   const [selectedRam, setSelectedRam] = useState<string[]>([]);
   const [selectedBattery, setSelectedBattery] = useState<string[]>([]);
   const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
   const [priceRange, setPriceRange] = useState<[number, number]>([
      0, 50000000,
   ]);

   const brands = [
      { id: "apple", name: "Apple" },
      { id: "samsung", name: "Samsung" },
      { id: "xiaomi", name: "Xiaomi" },
      { id: "oppo", name: "OPPO" },
      { id: "vivo", name: "Vivo" },
      { id: "realme", name: "realme" },
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

   const toggle = (
      list: string[],
      setList: (v: string[]) => void,
      val: string,
   ) =>
      setList(
         list.includes(val) ? list.filter((x) => x !== val) : [...list, val],
      );

   const hasFilters =
      selectedBrand.length > 0 ||
      selectedOS !== "all" ||
      selectedStorage.length > 0 ||
      selectedNetwork.length > 0 ||
      selectedRam.length > 0 ||
      selectedBattery.length > 0 ||
      selectedConnections.length > 0 ||
      priceRange[1] < 50000000;

   const resetAll = () => {
      setSelectedBrand([]);
      setSelectedOS("all");
      setSelectedStorage([]);
      setSelectedNetwork([]);
      setSelectedRam([]);
      setSelectedBattery([]);
      setSelectedConnections([]);
      setPriceRange([0, 50000000]);
   };

   // Reusable section header
   const SectionHeader = ({ label }: { label: string }) => (
      <div className="flex items-center justify-between py-2.5 border-b border-neutral mb-3">
         <span className="text-sm font-semibold text-primary">{label}</span>
         <ChevronDown className="w-4 h-4 text-primary-light" />
      </div>
   );

   // Reusable toggle chip
   const Chip = ({
      label,
      active,
      onClick,
   }: {
      label: string;
      active: boolean;
      onClick: () => void;
   }) => (
      <button
         type="button"
         onClick={onClick}
         className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer duration-150 ${
            active
               ? "border-accent bg-accent-light text-accent"
               : "border-neutral bg-neutral-light text-primary hover:border-accent-light hover:bg-accent-light/50"
         }`}
      >
         {label}
      </button>
   );

   return (
      <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
         {/* Header */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-neutral bg-neutral-light-active">
            <div className="flex items-center gap-2">
               <SlidersHorizontal className="w-4 h-4 text-accent" />
               <span className="text-sm font-bold text-primary">Bộ lọc</span>
            </div>
            {hasFilters && (
               <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1 text-xs text-promotion hover:text-promotion-hover transition-colors cursor-pointer"
               >
                  <X className="w-3.5 h-3.5" />
                  Xoá tất cả
               </button>
            )}
         </div>

         <div className="px-4 py-4 space-y-5">
            {/* Hãng sản xuất */}
            <div>
               <SectionHeader label="Hãng sản xuất" />
               <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                     <Chip
                        key={brand.id}
                        label={brand.name}
                        active={selectedBrand.includes(brand.id)}
                        onClick={() =>
                           toggle(selectedBrand, setSelectedBrand, brand.id)
                        }
                     />
                  ))}
               </div>
            </div>

            {/* Mức giá */}
            <div>
               <SectionHeader label="Mức giá" />
               <div className="space-y-1.5">
                  {priceOptions.map((option) => (
                     <label
                        key={option.value}
                        className="flex items-center gap-2.5 cursor-pointer group"
                     >
                        <input
                           type="radio"
                           name="price"
                           value={option.value}
                           className="w-3.5 h-3.5 accent-[rgb(var(--accent))]"
                        />
                        <span className="text-xs text-primary group-hover:text-accent transition-colors">
                           {option.label}
                        </span>
                     </label>
                  ))}
               </div>

               {/* Slider */}
               <div className="mt-4">
                  <p className="text-xs text-primary-light mb-2">
                     Hoặc nhập khoảng giá:
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                     <div className="flex-1 px-2 py-1.5 text-xs border border-neutral rounded-lg bg-neutral-light-active text-primary text-center">
                        {priceRange[0].toLocaleString("vi-VN")}đ
                     </div>
                     <span className="text-neutral-dark text-xs">–</span>
                     <div className="flex-1 px-2 py-1.5 text-xs border border-neutral rounded-lg bg-neutral-light-active text-primary text-center">
                        {priceRange[1].toLocaleString("vi-VN")}đ
                     </div>
                  </div>
                  <input
                     type="range"
                     min="0"
                     max="50000000"
                     step="500000"
                     value={priceRange[1]}
                     onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                     }
                     className="w-full accent-[rgb(var(--accent))] h-1.5 rounded-full cursor-pointer"
                  />
               </div>
            </div>

            {/* Hệ điều hành */}
            <div>
               <SectionHeader label="Hệ điều hành" />
               <div className="flex gap-2">
                  {["all", "ios", "android"].map((os) => (
                     <Chip
                        key={os}
                        label={
                           os === "all"
                              ? "Tất cả"
                              : os === "ios"
                                ? "iOS"
                                : "Android"
                        }
                        active={selectedOS === os}
                        onClick={() => setSelectedOS(os)}
                     />
                  ))}
               </div>
            </div>

            {/* Dung lượng ROM */}
            <div>
               <SectionHeader label="Dung lượng ROM" />
               <div className="flex flex-wrap gap-2">
                  {["≤128 GB", "256 GB", "512 GB", "1 TB"].map((s) => (
                     <Chip
                        key={s}
                        label={s}
                        active={selectedStorage.includes(s)}
                        onClick={() =>
                           toggle(selectedStorage, setSelectedStorage, s)
                        }
                     />
                  ))}
               </div>
            </div>

            {/* RAM */}
            <div>
               <SectionHeader label="RAM" />
               <div className="flex flex-wrap gap-2">
                  {["3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"].map(
                     (r) => (
                        <Chip
                           key={r}
                           label={r}
                           active={selectedRam.includes(r)}
                           onClick={() =>
                              toggle(selectedRam, setSelectedRam, r)
                           }
                        />
                     ),
                  )}
               </div>
            </div>

            {/* Kết nối */}
            <div>
               <SectionHeader label="Kết nối" />
               <div className="flex flex-wrap gap-2">
                  {["NFC", "Bluetooth", "Hồng ngoại"].map((c) => (
                     <Chip
                        key={c}
                        label={c}
                        active={selectedConnections.includes(c)}
                        onClick={() =>
                           toggle(
                              selectedConnections,
                              setSelectedConnections,
                              c,
                           )
                        }
                     />
                  ))}
               </div>
            </div>

            {/* Hỗ trợ mạng */}
            <div>
               <SectionHeader label="Hỗ trợ mạng" />
               <div className="flex gap-2">
                  {["5G", "4G"].map((n) => (
                     <Chip
                        key={n}
                        label={n}
                        active={selectedNetwork.includes(n)}
                        onClick={() =>
                           toggle(selectedNetwork, setSelectedNetwork, n)
                        }
                     />
                  ))}
               </div>
            </div>

            {/* Pin */}
            <div>
               <SectionHeader label="Dung lượng pin" />
               <div className="space-y-1.5">
                  {[
                     "Dưới 3000 mAh",
                     "3000 – 4000 mAh",
                     "4000 – 5500 mAh",
                     "Trên 5500 mAh",
                  ].map((b) => (
                     <label
                        key={b}
                        className="flex items-center gap-2.5 cursor-pointer group"
                     >
                        <input
                           type="checkbox"
                           checked={selectedBattery.includes(b)}
                           onChange={() =>
                              toggle(selectedBattery, setSelectedBattery, b)
                           }
                           className="w-3.5 h-3.5 rounded accent-[rgb(var(--accent))]"
                        />
                        <span className="text-xs text-primary group-hover:text-accent transition-colors">
                           {b}
                        </span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Apply button */}
            <button
               type="button"
               className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer"
            >
               Áp dụng bộ lọc
            </button>
         </div>
      </div>
   );
}
