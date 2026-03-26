"use client";
import { useCompareStore } from "../compareStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ProductDetail } from "@/lib/types/product";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";

// ── Search Slot ────────────────────────────────────────────────────────────
function AddSlot() {
  const { add } = useCompareStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { success, error, warning, info } = useToasty();

  // Click ngoài thì đóng
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest.get<{ data: { items: ProductDetail[] } }>(
        `/products?search=${encodeURIComponent(q)}&limit=5`,
        { noAuth: true },
      );
      setResults(res?.data?.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (product: ProductDetail) => {
    const result = add(product);

    if (!result.success) {
      switch (result.reason) {
        case "full":
          warning("Chỉ được so sánh tối đa 3 sản phẩm");
          break;

        case "duplicate":
          info("Sản phẩm đã có trong danh sách");
          break;

        case "wrong_category":
          error("Chỉ có thể so sánh các sản phẩm cùng danh mục sản phẩm đầu tiên trong trang so sánh!!");
          break;
      }
      return;
    }

    success("Đã thêm vào so sánh");

    setOpen(false);
    setQuery("");
    setResults([]);
  };
  

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(true)}
        className="w-[120px] h-16 rounded-xl border border-dashed border-neutral flex flex-col items-center justify-center gap-1 text-neutral-dark hover:bg-neutral/40 hover:text-primary transition-colors"
      >
        <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
          <Plus size={12} />
        </div>
        <span className="text-[11px]">Thêm sản phẩm</span>
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-72 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-neutral">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full text-xs bg-transparent outline-none text-primary placeholder:text-neutral-dark"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && (
              <p className="text-[11px] text-neutral-dark text-center py-4">
                Đang tìm...
              </p>
            )}
            {!loading && query && results.length === 0 && (
              <p className="text-[11px] text-neutral-dark text-center py-4">
                Không tìm thấy sản phẩm
              </p>
            )}
            {!loading && !query && (
              <p className="text-[11px] text-neutral-dark text-center py-4">
                Nhập tên sản phẩm để tìm
              </p>
            )}
            {results.map((p) => {
              const thumb = p.currentVariant.images?.[0]?.imageUrl;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral transition-colors border-b border-neutral last:border-0"
                >
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={p.name}
                      width={28}
                      height={28}
                      className="object-contain flex-shrink-0"
                    />
                  )}
                  <span className="text-xs text-primary text-left line-clamp-2">
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CompareBar ─────────────────────────────────────────────────────────────
export default function CompareBar() {
  const { items, remove, clear } = useCompareStore();
  const router = useRouter();
  const MAX = 4;

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-light border-t border-neutral shadow-lg px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {/* Label */}
        <span className="text-xs font-medium text-neutral-dark whitespace-nowrap flex-shrink-0">
          So sánh ({items.length}/{MAX})
        </span>

        {/* Slots */}
        <div className="flex gap-2.5 flex-1 items-center overflow-x-auto">
          {items.map((p) => {
            const thumb = p.currentVariant.images?.[0]?.imageUrl;
            return (
              <div
                key={p.id}
                className="relative flex-shrink-0 w-[120px] h-16 rounded-xl border border-neutral bg-neutral-light flex flex-col items-center justify-center gap-1 px-2"
              >
                {thumb && (
                  <Image
                    src={thumb}
                    alt={p.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                )}
                <span className="text-[10px] text-primary text-center leading-tight line-clamp-2 max-w-full">
                  {p.name}
                </span>
                <button
                  onClick={() => remove(p.id)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-neutral flex items-center justify-center text-neutral-dark hover:bg-red-100 hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}

          {/* Ô thêm sản phẩm — hiện khi chưa đủ 4 */}
          {items.length < MAX && <AddSlot />}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={clear}
            className="text-xs text-neutral-dark hover:text-red-500 underline underline-offset-2 transition-colors"
          >
            Xóa tất cả
          </button>
          <button
            disabled={items.length < 2}
            onClick={() => router.push("/compare")}
            className="text-xs font-medium bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-30 hover:opacity-80 transition-opacity"
          >
            So sánh ngay
          </button>
        </div>
      </div>
    </div>
  );
}
