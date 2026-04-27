"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search, Plus, RefreshCw, Package, CheckCircle2, EyeOff, Loader2, Trash2, X, Star, ArrowUpDown, ChevronDown, CalendarDays, AlertTriangle, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { ProductCard } from "./product.types";
import {
  getAllProducts,
  getDeletedProducts,
  softDeleteProduct,
  hardDeleteProduct,
  restoreProduct,
  toggleProductActive,
  bulkAction,
  getAdminProductStats,
  getCategories,
  type BulkAction,
  type LowStockProductInfo,
  type AdminProductStats,
  CategoryOption,
  exportProducts,
  downloadImportTemplate,
  importProducts,
} from "./_libs/products";
import { getProductColumns } from "./components/TableProducts";
import { StatsCard } from "@/components/admin/StatsCard";
import { StockAlertBanner } from "./components/StockAlertBanner";
import { ExportButton } from "@/components/admin/ExportButton";
import { ImportButton } from "@/components/admin/ImportButton";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Hiển thị" },
  { value: "inactive", label: "Đang ẩn" },
  { value: "low_stock", label: "Tồn kho thấp" },
  { value: "featured", label: "Nổi bật" },
  { value: "deleted", label: "Thùng rác" },
];

const SORT_OPTIONS = [
  { value: "createdAt", order: "desc", label: "Mới nhất" },
  { value: "createdAt", order: "asc", label: "Cũ nhất" },
  { value: "name", order: "asc", label: "Tên A → Z" },
  { value: "name", order: "desc", label: "Tên Z → A" },
  { value: "viewsCount", order: "desc", label: "Lượt xem nhiều nhất" },
  { value: "ratingAverage", order: "desc", label: "Đánh giá cao nhất" },
  { value: "totalSoldCount", order: "desc", label: "Bán chạy nhất" },
] as const;

type SortKey = `${(typeof SORT_OPTIONS)[number]["value"]}_${(typeof SORT_OPTIONS)[number]["order"]}`;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type SortOrder = (typeof SORT_OPTIONS)[number]["order"];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProductMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

const DEFAULT_META: ProductMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, outOfStock: 0, featured: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function injectAndSortProducts(products: ProductCard[], lowStockProducts: LowStockProductInfo[], outOfStockProducts: LowStockProductInfo[]): ProductCard[] {
  const lowMap = new Map(lowStockProducts.map((p) => [p.id, p]));
  const outMap = new Map(outOfStockProducts.map((p) => [p.id, p]));

  const enriched = products.map((p) => {
    if (outMap.has(p.id)) {
      return { ...p, stockWarning: "out_of_stock" as const, minQuantity: 0 };
    }
    const lowInfo = lowMap.get(p.id);
    if (lowInfo) {
      return { ...p, stockWarning: "low_stock" as const, minQuantity: lowInfo.minQuantity };
    }
    return p;
  });

  return [...enriched].sort((a, b) => getRowScore(a) - getRowScore(b));
}

function getRowScore(p: ProductCard): number {
  if ((p as any).stockWarning === "out_of_stock") return 0;
  if ((p as any).stockWarning === "low_stock") return 1;
  if (p.isFeatured) return 2;
  return 3;
}

function lowStockToCard(p: LowStockProductInfo, warning: "out_of_stock" | "low_stock"): ProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceOrigin: p.lowStockVariants[0]?.price ?? 0,
    thumbnail: p.thumbnail ?? "",
    rating: { average: 0, count: 0 },
    isFeatured: p.isFeatured,
    isNew: false,
    highlights: [],
    inStock: warning !== "out_of_stock",
    isActive: true,
    stockWarning: warning,
    minQuantity: p.minQuantity,
  } as ProductCard;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [meta, setMeta] = useState<ProductMeta>(DEFAULT_META);
  const [stats, setStats] = useState<AdminProductStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Query params ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ── Category ──────────────────────────────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  // NEW: search trong dropdown category
  const [categorySearch, setCategorySearch] = useState("");

  const dateRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // NEW: debounce ref cho search sản phẩm
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ProductCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Bulk action ───────────────────────────────────────────────────────────
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkAction | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
        setCategorySearch(""); // reset search khi đóng
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const [sortBy, sortOrder] = sortKey.split("_") as [SortValue, SortOrder];

  const tabToParams = (tab: string) => {
    if (tab === "active") return { isActive: true, inStock: undefined, isFeatured: undefined };
    if (tab === "inactive") return { isActive: false, inStock: undefined, isFeatured: undefined };
    if (tab === "featured") return { isActive: undefined, inStock: undefined, isFeatured: true };
    return { isActive: undefined, inStock: undefined, isFeatured: undefined };
  };

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminProductStats();
      setStats(res.data);
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (activeTab === "low_stock") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let res;
      if (activeTab === "deleted") {
        res = await getDeletedProducts({ page, limit: pageSize, search: search || undefined });
      } else {
        res = await getAllProducts({
          page,
          limit: pageSize,
          search: search || undefined,
          sortBy,
          sortOrder,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          categoryId: categoryId || undefined,
          ...tabToParams(activeTab),
        });
      }
      setProducts(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, sortBy, sortOrder, dateFrom, dateTo, categoryId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const outOfStockProducts = useMemo(() => stats?.outOfStockProducts ?? [], [stats]);
  const lowStockProducts = useMemo(() => stats?.lowStockProducts ?? [], [stats]);

  const sortedProducts = useMemo(() => {
    if (activeTab === "low_stock") {
      const outCards = outOfStockProducts.map((p) => lowStockToCard(p, "out_of_stock"));
      const lowCards = lowStockProducts.map((p) => lowStockToCard(p, "low_stock"));
      return [...outCards, ...lowCards];
    }
    if (activeTab === "deleted") return products;
    return injectAndSortProducts(products, lowStockProducts, outOfStockProducts);
  }, [products, lowStockProducts, outOfStockProducts, activeTab]);

  // ── Row className ─────────────────────────────────────────────────────────
  const getRowClassName = (product: ProductCard) => {
    const w = (product as any).stockWarning;
    if (w === "out_of_stock") return "bg-red-50/60 hover:bg-red-50";
    if (w === "low_stock") return "hover:bg-amber-50";
    return "";
  };

  // ── Misc helpers ──────────────────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(1), []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetPage();
  };

  // NEW: debounce search — tự động gọi API sau 400ms, không cần Enter
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value);
      resetPage();
    }, 400);
  };

  const handleClearSearch = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearchInput("");
    setSearch("");
    resetPage();
  };

  const handleClearDate = () => {
    setDateFrom("");
    setDateTo("");
    setShowDatePicker(false);
    resetPage();
  };

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    setShowSortDropdown(false);
    resetPage();
  };

  const handleClearAllFilters = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setCategoryId("");
    setCategorySearch("");
    setActiveTab("ALL");
    setSortKey("createdAt_desc");
    resetPage();
  };

  const handleRefresh = () => {
    fetchProducts();
    fetchStats();
  };

  const hasDateFilter = !!dateFrom || !!dateTo;
  const hasSortFilter = sortKey !== "createdAt_desc";
  const hasActiveFilters = !!(search || hasDateFilter || activeTab !== "ALL" || categoryId);

  // NEW: filtered categories cho dropdown search
  const filteredCategories = useMemo(() => (categorySearch ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase())) : categories), [categories, categorySearch]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === sortedProducts.length ? new Set() : new Set(sortedProducts.map((p) => p.id))));
  }, [sortedProducts]);

  // ── Status change — optimistic ────────────────────────────────────────────
  const handleStatusChange = useCallback(
    (productId: string, updates: { isActive?: boolean; isFeatured?: boolean }) => {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
      fetchStats();
    },
    [fetchStats],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((product: ProductCard) => {
    setDeleteTarget(product);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      (deleteTarget as any).deletedAt ? await hardDeleteProduct(deleteTarget.id) : await softDeleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
      fetchStats();
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchProducts, fetchStats]);

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const openBulkAction = (action: BulkAction) => {
    setBulkActionType(action);
    setShowBulkModal(true);
  };

  const handleBulkConfirm = useCallback(async () => {
    if (!bulkActionType || selected.size === 0) return;
    setBulkLoading(true);
    try {
      await bulkAction(bulkActionType, Array.from(selected));
      setShowBulkModal(false);
      setSelected(new Set());
      fetchProducts();
      fetchStats();
    } catch (e: any) {
      setError(e?.message ?? "Thao tác thất bại");
    } finally {
      setBulkLoading(false);
    }
  }, [bulkActionType, selected, fetchProducts, fetchStats]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getProductColumns({
        page,
        pageSize,
        selected,
        toggleOne,
        onStatusChange: handleStatusChange,
        onDeleteClick: handleDeleteClick,
      }),
    [page, pageSize, selected, toggleOne, handleStatusChange, handleDeleteClick],
  );

  // ── Tab count ─────────────────────────────────────────────────────────────
  const getTabCount = (tabValue: string) => {
    if (!stats) return meta.statusCounts[tabValue] ?? 0;
    if (tabValue === "ALL") return stats.total;
    if (tabValue === "active") return stats.active;
    if (tabValue === "inactive") return stats.inactive;
    if (tabValue === "featured") return stats.featured;
    if (tabValue === "deleted") return stats.deleted;
    if (tabValue === "low_stock") return (stats.outOfStock ?? 0) + (stats.lowStock ?? 0);
    return 0;
  };

  const showBanner = !statsLoading && (lowStockProducts.length > 0 || outOfStockProducts.length > 0);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Sản phẩm</h1>
            <p className="text-[13px] text-primary">Quản lý toàn bộ sản phẩm trong hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <ExportButton
            onExport={(fmt) =>
              exportProducts({
                format: fmt,
                categoryId: categoryId || undefined,
                isActive: activeTab === "active" ? true : activeTab === "inactive" ? false : undefined,
                inStock: activeTab === "low_stock" ? true : undefined,
                search: search || undefined,
              })
            }
            label="Export"
            disabled={loading}
            onSuccess={(count, fmt) => console.log(`Đã export ${count} biến thể dạng ${fmt.toUpperCase()}`)}
            onError={(err) => setError(err)}
          />
          <ImportButton
            onImport={importProducts}
            onDownloadTemplate={downloadImportTemplate}
            disabled={loading}
            onSuccess={(result) => {
              // Sau import xong → reload lại data + stats
              fetchProducts();
              fetchStats();
            }}
          />
          <Link
            href="/admin/products/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus size={15} /> Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="px-6 pb-5 grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatsCard label="Tổng sản phẩm" value={statsLoading ? "..." : (stats?.total ?? 0)} sub="Tất cả sản phẩm" icon={<Package size={18} />} valueClassName="text-accent" />
        <StatsCard
          label="Đang hiển thị"
          value={statsLoading ? "..." : (stats?.active ?? 0)}
          sub="Khách hàng có thể xem"
          icon={<CheckCircle2 size={18} />}
          valueClassName="text-emerald-600"
          iconClassName="text-emerald-600"
        />
        <StatsCard
          label="Đang ẩn"
          value={statsLoading ? "..." : (stats?.inactive ?? 0)}
          sub="Chưa hiển thị cho khách"
          icon={<EyeOff size={18} />}
          valueClassName="text-orange-500"
          iconClassName="text-orange-500"
        />
        <StatsCard
          label="Nổi bật"
          value={statsLoading ? "..." : (stats?.featured ?? 0)}
          sub="Sản phẩm được featured"
          icon={<Star size={18} />}
          valueClassName="text-amber-500"
          iconClassName="text-amber-500"
        />
        <StatsCard
          label="Hết hàng"
          value={statsLoading ? "..." : (stats?.outOfStock ?? 0)}
          sub="Không còn tồn kho"
          icon={<Package size={18} />}
          valueClassName="text-promotion"
          iconClassName="text-promotion"
        />
        <StatsCard
          label="Sắp hết hàng"
          value={statsLoading ? "..." : (stats?.lowStock ?? 0)}
          sub="Tồn kho dưới ngưỡng"
          icon={<AlertTriangle size={18} />}
          valueClassName={stats?.lowStock && stats.lowStock > 0 ? "text-amber-600" : "text-primary"}
          iconClassName={stats?.lowStock && stats.lowStock > 0 ? "text-amber-600" : "text-primary"}
        />
      </div>

      {/* ── Stock Alert Banner ── */}
      {showBanner && (
        <div className="px-6 pb-4 min-w-0 w-full">
          <StockAlertBanner lowStockProducts={lowStockProducts} outOfStockProducts={outOfStockProducts} />
        </div>
      )}

      {/* ── Main table card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* ── Toolbar ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {/* Status tabs */}
          {STATUS_TABS.map((tab) => {
            const count = getTabCount(tab.value);
            const isLowStockTab = tab.value === "low_stock";
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? (isLowStockTab ? "bg-amber-600 text-white" : "bg-accent text-white") : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive ? "bg-white/20 text-white" : isLowStockTab && count > 0 ? "bg-amber-100 text-amber-700" : "bg-neutral-light-active text-primary"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="w-px h-5 bg-neutral mx-1" />

          {/* Search — NEW: dùng handleSearchChange với debounce, bỏ onKeyDown Enter */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                // Vẫn giữ Enter để search ngay lập tức (không cần chờ debounce)
                if (e.key === "Enter") {
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  setSearch(searchInput);
                  resetPage();
                }
              }}
              placeholder="Tìm tên, slug..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          {activeTab !== "deleted" && activeTab !== "low_stock" && (
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSortDropdown((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                  hasSortFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
                }`}
              >
                <ArrowUpDown size={14} />
                {hasSortFilter ? SORT_OPTIONS.find((o) => `${o.value}_${o.order}` === sortKey)?.label : "Sắp xếp"}
                {hasSortFilter ? (
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("createdAt_desc");
                    }}
                    className="hover:text-promotion"
                  />
                ) : (
                  <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                )}
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                  <p className="px-3 py-2 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-neutral">Sắp xếp theo</p>
                  {SORT_OPTIONS.map((opt) => {
                    const key = `${opt.value}_${opt.order}` as SortKey;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSortChange(key)}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                          sortKey === key ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Date filter */}
          {activeTab !== "deleted" && activeTab !== "low_stock" && (
            <div ref={dateRef} className="relative">
              <button
                onClick={() => setShowDatePicker((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                  hasDateFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
                }`}
              >
                <CalendarDays size={14} />
                {hasDateFilter ? `${dateFrom || "..."} → ${dateTo || "..."}` : "Ngày tạo"}
                {hasDateFilter && (
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDate();
                    }}
                    className="hover:text-promotion"
                  />
                )}
              </button>
              {showDatePicker && (
                <div className="absolute top-full right-0 mt-1.5 w-72 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 p-4 space-y-3">
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Khoảng thời gian</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-primary">Từ ngày</label>
                      <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-primary">Đến ngày</label>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleClearDate} className="flex-1 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active cursor-pointer">
                      Xóa
                    </button>
                    <button
                      onClick={() => {
                        setShowDatePicker(false);
                        resetPage();
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category filter — NEW: có ô search bên trong dropdown */}
          {activeTab !== "deleted" && activeTab !== "low_stock" && (
            <div ref={categoryRef} className="relative">
              <button
                onClick={() => setShowCategoryDropdown((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                  categoryId ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
                }`}
              >
                <ChevronDown size={14} />
                {categoryId ? (categories.find((c) => c.id === categoryId)?.name ?? "Danh mục") : "Danh mục"}
                {categoryId && (
                  <X
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryId("");
                      resetPage();
                    }}
                    className="hover:text-promotion"
                  />
                )}
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden max-h-72 flex flex-col">
                  {/* Header + Search input — sticky */}
                  <div className="sticky top-0 bg-neutral-light border-b border-neutral shrink-0">
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-primary uppercase tracking-wider">Lọc theo danh mục</p>
                    <div className="relative px-2 pb-2">
                      <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
                      <input
                        autoFocus
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Tìm danh mục..."
                        className="w-full pl-7 pr-3 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                      />
                      {categorySearch && (
                        <button onClick={() => setCategorySearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary cursor-pointer">
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Danh sách cuộn */}
                  <div className="overflow-y-auto">
                    {/* "Tất cả" — chỉ hiện khi chưa search */}
                    {!categorySearch && (
                      <button
                        onClick={() => {
                          setCategoryId("");
                          setCategorySearch("");
                          setShowCategoryDropdown(false);
                          resetPage();
                        }}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                          !categoryId ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                        }`}
                      >
                        Tất cả danh mục
                      </button>
                    )}

                    {filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategoryId(cat.id);
                          setCategorySearch("");
                          setShowCategoryDropdown(false);
                          resetPage();
                        }}
                        className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                          categoryId === cat.id ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                        }`}
                      >
                        {cat.parentId && <span className="text-primary/40 mr-1">└</span>}
                        {cat.name}
                      </button>
                    ))}

                    {/* Không tìm thấy */}
                    {filteredCategories.length === 0 && <p className="px-3 py-4 text-[12px] text-primary/40 text-center">Không tìm thấy "{categorySearch}"</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clear filters */}
          {(hasActiveFilters || hasSortFilter) && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-primary">{activeTab === "low_stock" ? `${sortedProducts.length} sản phẩm` : `${meta.total} sản phẩm`}</span>
        </div>

        {/* ── Bulk action bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20 flex-wrap">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} sản phẩm</span>
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab !== "deleted" && (
                <>
                  <button
                    onClick={() => openBulkAction("activate")}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 rounded-lg border border-emerald-300 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hiển thị
                  </button>
                  <button
                    onClick={() => openBulkAction("deactivate")}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 rounded-lg border border-orange-300 text-[11px] font-medium text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Ẩn
                  </button>
                  <button
                    onClick={() => openBulkAction("feature")}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Nổi bật
                  </button>
                  <button
                    onClick={() => openBulkAction("unfeature")}
                    disabled={bulkLoading}
                    className="px-2.5 py-1 rounded-lg border border-neutral text-[11px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Bỏ nổi bật
                  </button>
                </>
              )}
              <button
                onClick={() => openBulkAction("delete")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-promotion/30 text-[11px] font-medium text-promotion hover:bg-promotion-light transition-colors cursor-pointer disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
            {bulkLoading && <Loader2 size={13} className="animate-spin text-accent" />}
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-primary cursor-pointer ml-auto">
              Bỏ chọn
            </button>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion/20">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={handleRefresh} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* ── Legend row ── */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && activeTab !== "deleted" && activeTab !== "low_stock" && (
          <div className="flex items-center gap-4 px-5 py-2 border-b border-neutral bg-neutral-light-active/30 text-[11px] text-primary">
            {lowStockProducts.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
                Sắp hết hàng
              </span>
            )}
            {outOfStockProducts.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
                Hết hàng
              </span>
            )}
          </div>
        )}

        {/* ── Note tab Tồn kho thấp ── */}
        {activeTab === "low_stock" && (
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-amber-200 bg-amber-50/50 text-[12px] text-amber-800">
            <AlertTriangle size={13} className="shrink-0 text-amber-500" />
            <span>
              Gồm <strong>{outOfStockProducts.length} sản phẩm hết hàng</strong> (đỏ) và <strong>{lowStockProducts.length} sản phẩm sắp hết</strong> (vàng, tồn kho ≤ 5). Cập nhật tồn kho để xóa khỏi
              danh sách này.
            </span>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">
              {activeTab === "low_stock" ? "Không có sản phẩm nào có tồn kho thấp 🎉" : hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có sản phẩm nào"}
            </p>
            {hasActiveFilters && activeTab !== "low_stock" && (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xóa bộ lọc
              </button>
            )}
            {!hasActiveFilters && activeTab === "ALL" && (
              <Link href="/admin/products/create" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Tạo sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={sortedProducts} selectable selectedIds={selected} onToggleAll={toggleAll} rowClassName={getRowClassName} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && meta.total > 0 && activeTab !== "low_stock" && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  resetPage();
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-primary">/ {meta.total} sản phẩm</span>
            </div>
            <AdminPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              siblingCount={1}
            />
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <Popzy
          isOpen={!!deleteTarget}
          onClose={() => !deleting && setDeleteTarget(null)}
          footer={false}
          closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
          content={
            <div className="py-2">
              <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                <Trash2 size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">{(deleteTarget as any).deletedAt ? "Xóa vĩnh viễn?" : "Xóa sản phẩm?"}</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xóa</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-2">"{deleteTarget.name}"</p>
              <p className="text-[12px] text-primary text-center mb-6">
                {(deleteTarget as any).deletedAt ? "Hành động này không thể hoàn tác." : "Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau."}
              </p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
                </button>
              </div>
            </div>
          }
        />
      )}

      {/* ── Bulk Modal ── */}
      <Popzy
        isOpen={showBulkModal}
        onClose={() => !bulkLoading && setShowBulkModal(false)}
        footer={false}
        closeMethods={bulkLoading ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <h3 className="text-[16px] font-bold text-primary text-center mb-2">Xác nhận thao tác hàng loạt</h3>
            <p className="text-[13px] text-primary/60 text-center mb-6">
              Áp dụng cho <strong className="text-primary">{selected.size} sản phẩm</strong> đã chọn?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                disabled={bulkLoading}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleBulkConfirm}
                disabled={bulkLoading}
                className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {bulkLoading && <Loader2 size={13} className="animate-spin" />}
                {bulkLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
