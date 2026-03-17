"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, EyeOff, Star } from "lucide-react";
import { toggleProductActive } from "../_libs/products";

export type ProductDisplayStatus = "active" | "inactive" | "featured";

interface ProductStatusConfig {
  label: string;
  dot: string;
  pill: string;
  dropdownHover: string;
}

export const PRODUCT_STATUS_CONFIG: Record<ProductDisplayStatus, ProductStatusConfig> = {
  active: {
    label: "Hiển thị",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dropdownHover: "hover:bg-emerald-50",
  },
  inactive: {
    label: "Đang ẩn",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-600 border border-orange-200",
    dropdownHover: "hover:bg-orange-50",
  },
  featured: {
    label: "Nổi bật",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-600 border border-amber-200",
    dropdownHover: "hover:bg-amber-50",
  },
};

// Lấy trạng thái hiển thị từ isActive + isFeatured
export function getProductDisplayStatus(isActive: boolean, isFeatured: boolean): ProductDisplayStatus {
  if (!isActive) return "inactive";
  if (isFeatured) return "featured";
  return "active";
}

interface ProductStatusCellProps {
  productId: string;
  isActive: boolean;
  isFeatured: boolean;
  onStatusChange: (productId: string, updates: { isActive?: boolean; isFeatured?: boolean }) => void;
}

const OPTIONS: { status: ProductDisplayStatus; icon: React.ReactNode }[] = [
  { status: "active", icon: <CheckCircle2 size={12} /> },
  { status: "inactive", icon: <EyeOff size={12} /> },
  { status: "featured", icon: <Star size={12} /> },
];

export function ProductStatusCell({ productId, isActive, isFeatured, onStatusChange }: ProductStatusCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = getProductDisplayStatus(isActive, isFeatured);
  const cfg = PRODUCT_STATUS_CONFIG[current];

  const handleSelect = async (next: ProductDisplayStatus) => {
    setOpen(false);
    if (next === current) return;

    // Map status → API payload
    const updates: { isActive: boolean; isFeatured: boolean } =
      next === "active" ? { isActive: true, isFeatured: false } : next === "inactive" ? { isActive: false, isFeatured: false } : { isActive: true, isFeatured: true };

    setLoading(true);
    try {
      await toggleProductActive(productId, updates.isActive, updates.isFeatured);
      onStatusChange(productId, updates);
    } catch {
      // silent — parent có thể xử lý
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !loading && setOpen((v) => !v)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none cursor-pointer ${cfg.pill} ${
          loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {loading ? "..." : cfg.label}
        {!loading && <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 min-w-[140px]">
          {OPTIONS.map(({ status, icon }) => {
            const c = PRODUCT_STATUS_CONFIG[status];
            const isSelected = status === current;
            return (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                  isSelected ? `${c.dropdownHover} font-semibold text-primary` : `${c.dropdownHover} text-primary`
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <span className="flex-1 text-left">{c.label}</span>
                {isSelected && <span className="text-accent text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
