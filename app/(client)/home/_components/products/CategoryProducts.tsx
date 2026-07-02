"use client";

import { useState } from "react";
import { Slidezy } from "@/components/slider";
import { CATEGORY_ICONS } from "@/lib/api/header/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = "dien-thoai" | "laptop" | "dien-may" | "phu-kien";

type Tab = {
  key: TabKey;
  label: string;
  icon: React.ElementType;
};

const TABS: Tab[] = [
  { key: "dien-thoai", label: "Điện thoại", icon: CATEGORY_ICONS["dien-thoai"] },
  { key: "laptop", label: "Laptop", icon: CATEGORY_ICONS["laptop"] },
  { key: "dien-may", label: "Điện máy", icon: CATEGORY_ICONS["dien-may"] },
  { key: "phu-kien", label: "Phụ kiện", icon: CATEGORY_ICONS["phu-kien"] },
];

// Placeholder prices per category (giả lập khác nhau)
const PRICE_RANGES: Record<TabKey, { original: string; sale: string; discount: string }[]> = {
  "dien-thoai": [
    { original: "31.990.000 đ", sale: "27.990.000 đ", discount: "Giảm 13%" },
    { original: "22.990.000 đ", sale: "19.490.000 đ", discount: "Giảm 15%" },
    { original: "15.990.000 đ", sale: "13.990.000 đ", discount: "Giảm 12%" },
    { original: "9.990.000 đ", sale: "8.490.000 đ", discount: "Giảm 15%" },
    { original: "7.490.000 đ", sale: "6.990.000 đ", discount: "Giảm 7%" },
    { original: "3.490.000 đ", sale: "3.210.000 đ", discount: "Giảm 8%" },
  ],
  laptop: [
    { original: "49.990.000 đ", sale: "44.990.000 đ", discount: "Giảm 10%" },
    { original: "35.990.000 đ", sale: "31.990.000 đ", discount: "Giảm 11%" },
    { original: "28.990.000 đ", sale: "24.990.000 đ", discount: "Giảm 14%" },
    { original: "22.490.000 đ", sale: "19.990.000 đ", discount: "Giảm 11%" },
    { original: "18.990.000 đ", sale: "16.490.000 đ", discount: "Giảm 13%" },
    { original: "14.990.000 đ", sale: "12.990.000 đ", discount: "Giảm 13%" },
  ],
  "dien-may": [
    { original: "25.990.000 đ", sale: "22.990.000 đ", discount: "Giảm 12%" },
    { original: "18.490.000 đ", sale: "15.990.000 đ", discount: "Giảm 13%" },
    { original: "12.990.000 đ", sale: "10.990.000 đ", discount: "Giảm 15%" },
    { original: "8.990.000 đ", sale: "7.490.000 đ", discount: "Giảm 17%" },
    { original: "5.990.000 đ", sale: "5.290.000 đ", discount: "Giảm 12%" },
    { original: "4.490.000 đ", sale: "3.990.000 đ", discount: "Giảm 11%" },
  ],
  "phu-kien": [
    { original: "4.990.000 đ", sale: "3.990.000 đ", discount: "Giảm 20%" },
    { original: "2.990.000 đ", sale: "2.490.000 đ", discount: "Giảm 17%" },
    { original: "1.990.000 đ", sale: "1.690.000 đ", discount: "Giảm 15%" },
    { original: "1.490.000 đ", sale: "1.190.000 đ", discount: "Giảm 20%" },
    { original: "990.000 đ", sale: "790.000 đ", discount: "Giảm 20%" },
    { original: "590.000 đ", sale: "490.000 đ", discount: "Giảm 17%" },
  ],
};

const PRODUCT_NAMES: Record<TabKey, string[]> = {
  "dien-thoai": ["Samsung Galaxy S25 Ultra 5G", "iPhone 16 Pro Max 256GB", "Xiaomi 15 Ultra 512GB", "OPPO Find X8 Pro 5G", "Vivo X200 Pro 5G", "Xiaomi Redmi 13x 8GB"],
  laptop: ["MacBook Pro 16 M5 Max 2025", "Dell XPS 15 9530 i9 RTX4070", "ASUS ROG Zephyrus G16 2025", "Lenovo ThinkPad X1 Carbon", "HP Spectre x360 14 OLED", "Acer Swift X 14 OLED 2025"],
  "dien-may": [
    "Tivi Samsung QLED 4K 65 inch",
    "Máy lạnh LG Inverter 1.5HP",
    "Tủ lạnh Samsung Side By Side",
    "Máy giặt Aqua Inverter 10kg",
    "Lò vi sóng Panasonic 25L",
    "Nồi chiên không dầu Philips 6L",
  ],
  "phu-kien": ["Tai nghe Sony WH-1000XM5", "Loa JBL Flip 6 Bluetooth", "Sạc nhanh Anker 67W GaN", "Ốp lưng MagSafe iPhone 16", "Cáp USB-C Baseus 100W", "Bàn phím cơ Keychron K2 Pro"],
};

// ─── Placeholder Card ─────────────────────────────────────────────────────────

function PlaceholderCard({ tabKey, index }: { tabKey: TabKey; index: number }) {
  const price = PRICE_RANGES[tabKey][index % PRICE_RANGES[tabKey].length];
  const name = PRODUCT_NAMES[tabKey][index % PRODUCT_NAMES[tabKey].length];

  return (
    <div className="bg-surface rounded-xl border border-surface-border overflow-hidden group hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Image area */}
      <div className="relative bg-neutral-light aspect-square flex items-center justify-center overflow-hidden">
        {/* Discount badge */}
        <div className="absolute top-2 left-0 z-10">
          <span className="bg-accent text-white text-[11px] font-semibold px-2 py-0.5 rounded-r-full shadow-sm">{price.discount}</span>
        </div>

        {/* Wishlist */}
        <button className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-neutral hover:text-accent transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Skeleton image placeholder */}
        <div className="w-3/5 h-3/5 rounded-lg bg-neutral/10 animate-pulse" />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-sm font-medium text-primary line-clamp-2 leading-snug">{name}</p>

        <div className="mt-auto pt-1 flex flex-col gap-0.5">
          <span className="text-xs text-neutral line-through">{price.original}</span>
          <span className="text-sm font-bold text-accent">{price.sale}</span>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-neutral">(24)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PLACEHOLDER_COUNT = 8;

export function CategoryProducts() {
  const [activeTab, setActiveTab] = useState<TabKey>("dien-thoai");

  return (
    <section className="py-2 md:py-4">
      <div className="container">
        <div className="bg-surface rounded-2xl overflow-hidden">
          {/* ── Header + Tabs ── */}
          <div className="border-b border-surface-border">
            {/* Title + Tabs — cùng 1 row trên desktop, tách dòng mobile */}
            <div className="px-5 md:px-7 pt-5 md:pt-6 flex flex-col sm:flex-row sm:items-center sm:gap-6">
              {/* Title động theo tab đang active */}
              <div className="flex items-center gap-3 shrink-0 pb-3 sm:pb-0">
                <div className="w-1 h-5 rounded-full bg-accent shrink-0" />
                <h2 className="text-lg md:text-xl font-bold text-primary tracking-tight">
                  {TABS.find((t) => t.key === activeTab)?.label} <span className="font-normal text-secondary">bán chạy</span>
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0">
                {TABS.map((tab, idx) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={[
                        "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 shrink-0",
                        // divider giữa các tab
                        idx !== TABS.length - 1 ? "border-r border-surface-border" : "",
                        isActive ? "text-accent" : "text-primary/60 hover:text-primary",
                      ].join(" ")}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>

                      {/* Active underline */}
                      {isActive && <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Product Grid ── */}
          <div className="px-3 md:px-5 py-4">
            <Slidezy
              items={{ mobile: 2, tablet: 2, lg: 3, desktop: 4 }}
              gap={16}
              speed={300}
              loop={false}
              nav={false}
              mobileNav="none"
              controls={{ mobile: false, tablet: false, lg: true, desktop: true }}
              slideBy={1}
              draggable={true}
            >
              {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
                <div
                  key={`${activeTab}-${index}`}
                  className={[
                    "border-neutral/40",
                    // divider dọc giữa cards — ẩn trên mobile (2 cols), hiện desktop
                    index % 4 !== 3 ? "lg:border-r" : "",
                  ].join(" ")}
                >
                  <div className="p-0 lg:pr-4">
                    <PlaceholderCard tabKey={activeTab} index={index} />
                  </div>
                </div>
              ))}
            </Slidezy>
          </div>

          {/* ── View all link ── */}
          <div className="px-5 md:px-7 pb-5 flex justify-center">
            <button className="text-sm font-medium text-accent hover:underline flex items-center gap-1 transition-opacity hover:opacity-80">
              Xem tất cả {TABS.find((t) => t.key === activeTab)?.label}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
