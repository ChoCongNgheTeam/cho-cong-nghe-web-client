"use client";

import { forwardRef, useImperativeHandle, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { SpecificationGroup } from "@/lib/types/product";
import Image from "next/image";
import { toId } from "../../../../../helpers/toSpecGroupId";

export interface ProductSpecsModalRef {
  open: () => void;
  close: () => void;
}

interface ProductSpecsModalProps {
  specifications?: SpecificationGroup[];
  isLoading?: boolean;
  productName?: string;
  productImage?: string;
}

// Dùng chung cho cả MobileView và DesktopView — trước đây định nghĩa inline lặp lại 2 lần
interface SpecTab {
  id: string;
  label: string;
  data: { label: string; value: string }[];
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-neutral last:border-none">
      <span className="text-sm w-2/5 shrink-0 leading-snug text-neutral-dark">{label}</span>
      <span className="text-sm font-medium leading-snug flex-1 text-primary">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 rounded-full bg-neutral flex items-center justify-center text-2xl">📄</div>
      <p className="text-sm font-medium text-neutral-dark">Không có thông số kỹ thuật</p>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 h-[70vh]">
      {/* Mobile skeleton */}
      <div className="block md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-neutral rounded-xl animate-pulse" />
        ))}
      </div>
      {/* Desktop skeleton */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 h-full">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="md:col-span-3 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 bg-neutral rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileView({ tabs }: { tabs: SpecTab[] }) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isManualScrollRef = useRef(false);

  // IntersectionObserver: tự động cập nhật active tab khi user kéo
  useEffect(() => {
    if (!scrollRef.current) return;

    const sections = tabs.map((t) => document.getElementById(toId(t.id)));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isManualScrollRef.current) return;

        // Tìm entry có ratio cao nhất đang visible bằng .reduce()
        // Cách này giúp TypeScript hiểu rõ kiểu dữ liệu mà không bị "lú" ở phạm vi biến (scope)
        const bestEntry = entries.reduce<IntersectionObserverEntry | null>((highest, current) => {
          if (highest === null) return current;
          return current.intersectionRatio > highest.intersectionRatio ? current : highest;
        }, null);

        // Kiểm tra nếu tìm được entry hợp lệ và vượt ngưỡng tỉ lệ hiển thị (ratio > 0.15)
        if (bestEntry && bestEntry.intersectionRatio > 0.15) {
          // bestEntry.target.id chính là id của phần tử đang được quan sát
          const matched = tabs.find((t) => toId(t.id) === bestEntry.target.id);
          if (matched) setActiveId(matched.id);
        }
      },
      {
        root: scrollRef.current,
        threshold: [0, 0.15, 0.5, 1],
        rootMargin: "-10% 0px -60% 0px",
      },
    );

    sections.forEach((s) => s && observerRef.current?.observe(s));
    return () => observerRef.current?.disconnect();
  }, [tabs]);

  // Click tab → smooth scroll đến section
  const handleTabClick = useCallback((id: string) => {
    setActiveId(id);
    isManualScrollRef.current = true;
    const el = document.getElementById(toId(id));
    if (el && scrollRef.current) {
      // offset = height của sticky tab bar (~44px)
      const offset = (tabBarRef.current?.offsetHeight ?? 44) + 4;
      const top = el.offsetTop - offset;
      scrollRef.current.scrollTo({ top, behavior: "smooth" });
    }
    // Reset flag sau khi scroll xong (khoảng 600ms)
    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 700);
  }, []);

  // Scroll active tab button vào giữa tab bar khi đổi
  useEffect(() => {
    if (!tabBarRef.current) return;
    const btn = tabBarRef.current.querySelector(`[data-tab-id="${activeId}"]`) as HTMLElement;
    if (btn) {
      btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  if (tabs.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col h-[75vh]">
      {/* Sticky tab bar */}
      <div ref={tabBarRef} className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 border-b border-neutral bg-neutral-light sticky top-0 z-10">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`shrink-0 px-4 py-3 text-[13px] font-medium whitespace-nowrap transition-colors relative cursor-pointer ${isActive ? "text-accent" : "text-neutral-dark"}`}
            >
              {tab.label}
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {tabs.map((tab) => (
          <section key={tab.id} id={toId(tab.id)} className="px-4 pt-5 pb-2">
            <h3 className="text-[13px] font-bold uppercase tracking-wider mb-1 pb-2 border-b-2 text-accent border-accent">{tab.label}</h3>

            {tab.data.map((row, idx) => (
              <SpecRow key={idx} {...row} />
            ))}
          </section>
        ))}
        {/* Bottom padding để section cuối có thể scroll lên trên */}
        <div className="h-20" />
      </div>
    </div>
  );
}

function DesktopView({ tabs }: { tabs: SpecTab[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (tabs.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-4 h-[65vh]">
      {/* Sidebar */}
      <div className="border-r border-neutral overflow-y-auto [scrollbar-width:thin] py-2">
        {tabs.map((tab, index) => {
          const isActive = activeIdx === index;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveIdx(index)}
              className={`relative w-full text-left px-4 py-3 cursor-pointer text-sm font-medium border-b border-neutral/50 transition-all duration-150 last:border-none ${
                isActive ? "text-accent bg-accent/[0.06]" : "text-primary bg-transparent"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-accent" />}
              <span className={isActive ? "pl-2" : ""}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="col-span-3 overflow-y-auto [scrollbar-width:thin] px-6 py-4">
        {/* Group title */}
        <h3 className="text-base font-bold mb-4 pb-3 border-b-2 text-accent border-accent/30">{tabs[activeIdx]?.label}</h3>

        <div>
          {tabs[activeIdx]?.data.map((row, idx) => (
            <SpecRow key={idx} {...row} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ProductSpecsModal = forwardRef<ProductSpecsModalRef, ProductSpecsModalProps>(function ProductSpecsModal({ specifications, isLoading = false, productName, productImage }, ref) {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  useEffect(() => {
    // Ẩn/hiện ChatButton (cùng pattern MobileNotificationSheet)
    window.dispatchEvent(new CustomEvent("sheet:toggle", { detail: { open } }));

    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  const tabs = useMemo<SpecTab[]>(() => {
    return (specifications ?? []).map((group) => ({
      id: group.groupName,
      label: group.groupName,
      data: group.items.map((item) => ({
        label: item.name,
        value: item.unit ? `${item.value} ${item.unit}` : item.value,
      })),
    }));
  }, [specifications]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-0 md:px-4" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div
        className="bg-neutral-light w-full md:max-w-4xl rounded-none md:rounded-2xl shadow-2xl overflow-hidden border-0 md:border border-neutral flex flex-col"
        style={{ maxHeight: "calc(100dvh - 0px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Product thumbnail */}
            {productImage && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral shrink-0 bg-neutral/40">
                <Image src={productImage} alt={productName ?? "Sản phẩm"} width={40} height={40} className="object-contain w-full h-full" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider mb-0.5 text-neutral-dark">Thông số kỹ thuật</p>
              {productName && <h2 className="text-sm font-semibold text-primary truncate leading-tight">{productName}</h2>}
            </div>
          </div>

          <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-neutral transition-colors cursor-pointer shrink-0 ml-2" aria-label="Đóng">
            <X className="w-5 h-5 text-neutral-dark" />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <SkeletonLoading />
        ) : (
          <>
            {/* Mobile */}
            <div className="block md:hidden">
              <MobileView tabs={tabs} />
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <DesktopView tabs={tabs} />
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default ProductSpecsModal;
