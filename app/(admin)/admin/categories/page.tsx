"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
   Search,
   Plus,
   Eye,
   Pencil,
   Trash2,
   X,
   RefreshCw,
   Loader2,
   ImageOff,
   FolderTree,
   Layers,
   Star,
   ChevronRight,
   ChevronDown,
   AlertCircle,
   SlidersHorizontal,
   ChevronsDownUp,
   ChevronsUpDown,
} from "lucide-react";
import type {
   Category,
   CategoryMeta,
   GetCategoriesParams,
} from "./category.types";
import {
   getCategoriesAdmin,
   softDeleteCategory,
   updateCategory,
} from "./_libs/categories";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryNode extends Category {
   children: CategoryNode[];
   depth: number; // 0 = root, 1 = con, 2 = cháu
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
   { label: "Tất cả", value: "ALL" },
   { label: "Hoạt động", value: "active" },
   { label: "Ẩn", value: "inactive" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

const SORT_OPTIONS = [
   { label: "Vị trí", value: "position" },
   { label: "Tên", value: "name" },
   { label: "Ngày tạo", value: "createdAt" },
];

const FEATURED_OPTIONS = [
   { label: "Tất cả", value: "" },
   { label: "Nổi bật", value: "true" },
   { label: "Không nổi bật", value: "false" },
];

const DEFAULT_META: CategoryMeta = {
   page: 1,
   limit: 200, // fetch nhiều hơn để build tree client-side
   total: 0,
   totalPages: 1,
   statusCounts: { ALL: 0, active: 0, inactive: 0, featured: 0 },
};

// Indent theo depth
const DEPTH_INDENT = [0, 20, 40] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TREE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): CategoryNode[] {
   const map = new Map<string, CategoryNode>();
   flat.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));

   const roots: CategoryNode[] = [];
   map.forEach((node) => {
      if (!node.parentId) {
         roots.push(node);
      } else {
         const parent = map.get(node.parentId);
         if (parent) {
            parent.children.push(node);
         } else {
            roots.push(node);
         }
      }
   });

   // Tính depth SAU khi đã build xong cấu trúc cây
   const assignDepth = (nodes: CategoryNode[], depth: number) => {
      nodes.forEach((n) => {
         n.depth = depth;
         assignDepth(n.children, depth + 1);
      });
   };
   assignDepth(roots, 0);

   const sortNodes = (nodes: CategoryNode[]) => {
      nodes.sort(
         (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) ||
            a.name.localeCompare(b.name, "vi"),
      );
      nodes.forEach((n) => sortNodes(n.children));
   };
   sortNodes(roots);
   return roots;
}

// Flatten tree thành mảng phẳng để render (giữ order đúng)
function flattenTree(
   nodes: CategoryNode[],
   expandedIds: Set<string>,
): CategoryNode[] {
   const result: CategoryNode[] = [];
   const walk = (list: CategoryNode[]) => {
      list.forEach((node) => {
         result.push(node);
         if (node.children.length > 0 && expandedIds.has(node.id)) {
            walk(node.children);
         }
      });
   };
   walk(nodes);
   return result;
}

// Search: trả về tất cả node match + ancestors của chúng
function searchTree(nodes: CategoryNode[], q: string): CategoryNode[] {
   const lq = q.toLowerCase();
   const result: CategoryNode[] = [];
   const seen = new Set<string>();

   const walk = (node: CategoryNode, ancestors: CategoryNode[]) => {
      const match =
         node.name.toLowerCase().includes(lq) ||
         node.slug.toLowerCase().includes(lq);

      if (match) {
         // thêm ancestors trước
         ancestors.forEach((a) => {
            if (!seen.has(a.id)) {
               seen.add(a.id);
               result.push(a);
            }
         });
         if (!seen.has(node.id)) {
            seen.add(node.id);
            result.push(node);
         }
         // thêm tất cả children của match
         const addAllChildren = (children: CategoryNode[]) => {
            children.forEach((c) => {
               if (!seen.has(c.id)) {
                  seen.add(c.id);
                  result.push(c);
               }
               addAllChildren(c.children);
            });
         };
         addAllChildren(node.children);
      } else {
         node.children.forEach((child) => walk(child, [...ancestors, node]));
      }
   };

   nodes.forEach((n) => walk(n, []));
   return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// CategoryImage
// ─────────────────────────────────────────────────────────────────────────────

function CategoryImage({
   category,
   size = 9,
}: {
   category: Category;
   size?: number;
}) {
   const [imgError, setImgError] = useState(false);
   const src = category.imageUrl ?? category.imagePath ?? null;
   const px = size * 4; // tailwind w-9 = 36px
   if (src && !imgError) {
      return (
         <div
            className="relative shrink-0 rounded-lg overflow-hidden border border-neutral/40 bg-neutral-light-active"
            style={{ width: px, height: px }}
         >
            <Image
               src={src}
               alt={category.name}
               fill
               className="object-cover"
               onError={() => setImgError(true)}
               unoptimized
            />
         </div>
      );
   }
   return (
      <div
         className="rounded-lg bg-neutral-light-active flex items-center justify-center shrink-0 border border-neutral/30"
         style={{ width: px, height: px }}
      >
         <ImageOff size={Math.max(11, size - 4)} className="text-primary/40" />
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusDropdown
// ─────────────────────────────────────────────────────────────────────────────

function StatusDropdown({
   category,
   onUpdated,
}: {
   category: Category;
   onUpdated: (id: string, patch: Partial<Category>) => void;
}) {
   const [open, setOpen] = useState(false);
   const [loading, setLoading] = useState(false);
   const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
   const btnRef = useRef<HTMLButtonElement>(null);

   const toggle = async (field: "isActive" | "isFeatured", value: boolean) => {
      setOpen(false);
      setLoading(true);
      try {
         const fd = new FormData();
         fd.append("data", JSON.stringify({ [field]: value }));
         await updateCategory(category.id, fd);
         onUpdated(category.id, { [field]: value });
      } catch {
         // silently fail
      } finally {
         setLoading(false);
      }
   };

   const handleOpen = () => {
      if (btnRef.current) {
         const rect = btnRef.current.getBoundingClientRect();
         const dropdownHeight = 240;
         const spaceBelow = window.innerHeight - rect.bottom;
         const showAbove =
            spaceBelow < dropdownHeight && rect.top > dropdownHeight;
         setDropPos({
            top: showAbove
               ? rect.top + window.scrollY - dropdownHeight
               : rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
         });
      }
      setOpen((v) => !v);
   };

   return (
      <div className="relative">
         <button
            ref={btnRef}
            onClick={handleOpen}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
               category.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
            } ${loading ? "opacity-60" : ""}`}
         >
            {loading ? (
               <Loader2 size={10} className="animate-spin" />
            ) : (
               <span
                  className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-emerald-500" : "bg-orange-400"}`}
               />
            )}
            {category.isActive ? "Hoạt động" : "Ẩn"}
            <ChevronDown size={10} />
         </button>

         {open &&
            createPortal(
               <>
                  <div
                     className="fixed inset-0 z-[100]"
                     onClick={() => setOpen(false)}
                  />
                  <div
                     className="fixed z-[101] w-44 bg-white border border-neutral rounded-xl shadow-lg py-1 max-h-72 overflow-y-auto"
                     style={{ top: dropPos.top, left: dropPos.left }}
                  >
                     <p className="px-3 py-1.5 text-[10px] font-bold text-primary uppercase tracking-wider border-b border-neutral mb-1">
                        Trạng thái hiển thị
                     </p>
                     {(
                        [
                           {
                              label: "Hoạt động",
                              value: true,
                              dot: "bg-emerald-500",
                           },
                           { label: "Ẩn", value: false, dot: "bg-orange-400" },
                        ] as const
                     ).map((opt) => (
                        <button
                           key={String(opt.value)}
                           onClick={() => toggle("isActive", opt.value)}
                           disabled={category.isActive === opt.value}
                           className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors cursor-pointer ${
                              category.isActive === opt.value
                                 ? "bg-neutral-light-active text-primary font-medium cursor-default"
                                 : "text-primary hover:bg-neutral-light-active"
                           }`}
                        >
                           <span
                              className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`}
                           />
                           {opt.label}
                           {category.isActive === opt.value && (
                              <span className="ml-auto text-[10px] text-accent">
                                 ✓
                              </span>
                           )}
                        </button>
                     ))}

                     <div className="border-t border-neutral mt-1 pt-1">
                        <p className="px-3 py-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                           Nổi bật
                        </p>
                        {(
                           [
                              { label: "Nổi bật", value: true, icon: "⭐" },
                              { label: "Bình thường", value: false, icon: "—" },
                           ] as const
                        ).map((opt) => (
                           <button
                              key={String(opt.value)}
                              onClick={() => toggle("isFeatured", opt.value)}
                              disabled={category.isFeatured === opt.value}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors cursor-pointer ${
                                 category.isFeatured === opt.value
                                    ? "bg-neutral-light-active text-primary font-medium cursor-default"
                                    : "text-primary hover:bg-neutral-light-active"
                              }`}
                           >
                              <span className="w-2 shrink-0 text-center">
                                 {opt.icon}
                              </span>
                              {opt.label}
                              {category.isFeatured === opt.value && (
                                 <span className="ml-auto text-[10px] text-accent">
                                    ✓
                                 </span>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>
               </>,
               document.body,
            )}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeleteConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmModal({
   category,
   onConfirm,
   onCancel,
   loading,
}: {
   category: Category;
   onConfirm: () => void;
   onCancel: () => void;
   loading: boolean;
}) {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
         <div className="bg-neutral-light border border-neutral rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-promotion-light flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-promotion" />
               </div>
               <div>
                  <p className="text-[14px] font-semibold text-primary">
                     Xóa danh mục?
                  </p>
                  <p className="text-[12px] text-primary mt-0.5">
                     Hành động này có thể hoàn tác
                  </p>
               </div>
            </div>
            <p className="text-[13px] text-primary bg-neutral-light-active px-3 py-2 rounded-xl border border-neutral">
               <span className="font-medium">{category.name}</span>
            </p>
            <div className="flex gap-2 pt-1">
               <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
               >
                  Huỷ
               </button>
               <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-promotion hover:bg-promotion/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
               >
                  {loading ? (
                     <Loader2 size={13} className="animate-spin" />
                  ) : (
                     <Trash2 size={13} />
                  )}
                  Xóa
               </button>
            </div>
         </div>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// TreeRow — một dòng trong tree
// ─────────────────────────────────────────────────────────────────────────────

const DEPTH_BG = [
   "", // root: trắng
   "bg-neutral-light-active/30", // cấp 1
   "bg-neutral-light-active/60", // cấp 2
];

const DEPTH_BORDER_COLOR = [
   "border-accent/40",
   "border-violet-300",
   "border-rose-200",
];

function TreeRow({
   node,
   idx,
   isExpanded,
   onToggle,
   onUpdated,
   onDelete,
}: {
   node: CategoryNode;
   idx: number;
   isExpanded: boolean;
   onToggle: (id: string) => void;
   onUpdated: (id: string, patch: Partial<Category>) => void;
   onDelete: (cat: Category) => void;
}) {
   const hasChildren = node.children.length > 0;
   const hasProducts = (node._count?.products ?? 0) > 0;
   const hasChildrenCount = (node._count?.children ?? 0) > 0;
   const canDelete = !hasProducts && !hasChildrenCount;
   const indent = DEPTH_INDENT[node.depth] ?? 40;
   console.log(node);
   return (
      <tr
         className={`border-b border-neutral transition-colors duration-100 hover:bg-neutral-light-active/40 ${DEPTH_BG[node.depth] ?? DEPTH_BG[2]}`}
      >
         {/* STT */}
         <td className="px-4 py-3 text-[12px] text-primary/50 w-10 tabular-nums">
            {idx + 1}
         </td>

         {/* Danh mục */}
         <td className="px-4 py-3">
            <div
               className="flex items-center gap-2"
               style={{ paddingLeft: indent }}
            >
               {/* Tree line visual */}
               {node.depth > 0 && (
                  <span className="shrink-0 flex items-center">
                     {/* vertical + horizontal connector */}
                     <span
                        className={`inline-block w-3 h-px ${DEPTH_BORDER_COLOR[node.depth]} border-t`}
                     />
                  </span>
               )}

               {/* Expand/collapse toggle */}
               {hasChildren ? (
                  <button
                     onClick={() => onToggle(node.id)}
                     className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-accent/10 text-primary/60 hover:text-accent transition-colors shrink-0 cursor-pointer"
                     title={isExpanded ? "Thu gọn" : "Mở rộng"}
                  >
                     {isExpanded ? (
                        <ChevronDown size={13} />
                     ) : (
                        <ChevronRight size={13} />
                     )}
                  </button>
               ) : (
                  <span className="w-5 shrink-0" />
               )}

               <CategoryImage category={node} size={node.depth === 0 ? 9 : 8} />

               <div className="min-w-0">
                  <div
                     className={`font-medium text-primary truncate max-w-[240px] ${
                        node.depth === 0 ? "text-[13px]" : "text-[12px]"
                     }`}
                  >
                     {node.name}
                  </div>
                  <div className="text-[10px] text-primary/50 font-mono truncate max-w-[240px]">
                     /{node.slug}
                  </div>
               </div>
            </div>
         </td>

         {/* Cấp */}
         <td className="px-4 py-3 whitespace-nowrap">
            {node.depth === 0 && (
               <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                  Gốc
               </span>
            )}
            {node.depth === 1 && (
               <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                  Cấp 2
               </span>
            )}
            {node.depth === 2 && (
               <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-500 border border-rose-100">
                  Cấp 3
               </span>
            )}
         </td>

         {/* Danh mục con */}
         <td className="px-4 py-3 text-[12px] text-primary">
            {hasChildrenCount ? (
               <button
                  onClick={() => onToggle(node.id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium hover:bg-accent/20 transition-colors cursor-pointer"
               >
                  <FolderTree size={11} />
                  {node._count.children} mục
               </button>
            ) : (
               <span className="text-primary/30 text-[11px]">—</span>
            )}
         </td>

         {/* Vị trí */}
         <td className="px-4 py-3 text-[12px] text-primary/60 tabular-nums">
            {node.position ?? 0}
         </td>

         {/* Trạng thái */}
         <td className="px-4 py-3">
            <div className="flex items-center gap-1.5 flex-wrap">
               <StatusDropdown category={node} onUpdated={onUpdated} />
               {node.isFeatured && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
                     <Star size={8} fill="currentColor" /> Nổi bật
                  </span>
               )}
            </div>
         </td>

         {/* Hành động */}
         <td className="px-4 py-3">
            <div className="flex items-center gap-0.5">
               <Link
                  href={`/admin/categories/${node.id}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-primary/60 hover:bg-accent/10 hover:text-accent transition-all"
                  title="Xem chi tiết"
               >
                  <Eye size={13} />
               </Link>
               <Link
                  href={`/admin/categories/${node.id}/edit`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-primary/60 hover:bg-accent/10 hover:text-accent transition-all"
                  title="Chỉnh sửa"
               >
                  <Pencil size={13} />
               </Link>
               {canDelete ? (
                  <button
                     onClick={() => onDelete(node)}
                     className="w-7 h-7 flex items-center justify-center rounded-lg text-primary/60 hover:bg-promotion-light hover:text-promotion transition-all cursor-pointer"
                     title="Xóa"
                  >
                     <Trash2 size={13} />
                  </button>
               ) : (
                  <span className="w-7 h-7" />
               )}
            </div>
         </td>
      </tr>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
   const [allCategories, setAllCategories] = useState<Category[]>([]);
   const [meta, setMeta] = useState<CategoryMeta>(DEFAULT_META);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // filter state
   const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
   const [searchInput, setSearchInput] = useState("");
   const [search, setSearch] = useState("");
   const [sortBy, setSortBy] = useState("position");
   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
   const [featuredFilter, setFeaturedFilter] = useState("");

   // tree state
   const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

   // delete modal
   const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
   const [deleteLoading, setDeleteLoading] = useState(false);

   const hasActiveFilters =
      activeTab !== "ALL" ||
      !!search ||
      sortBy !== "position" ||
      featuredFilter !== "";

   // ── fetch ALL (không paginate server-side, tree client-side) ──────────────
   const fetchCategories = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const params: GetCategoriesParams = {
            page: 1,
            limit: 200, // max cho phép từ server
            sortBy: sortBy as any,
            sortOrder,
            ...(search && { search }),
            ...(activeTab === "active" && { isActive: true }),
            ...(activeTab === "inactive" && { isActive: false }),
            ...(featuredFilter === "true" && { isFeatured: true }),
            ...(featuredFilter === "false" && { isFeatured: false }),
         };
         const res = await getCategoriesAdmin(params);
         setAllCategories(res.data ?? []);
         setMeta(res.meta ?? DEFAULT_META);
      } catch (err: any) {
         setError(err?.message ?? "Không thể tải danh sách danh mục");
      } finally {
         setLoading(false);
      }
   }, [activeTab, search, sortBy, sortOrder, featuredFilter]);

   useEffect(() => {
      fetchCategories();
   }, [fetchCategories]);

   // ── build tree ─────────────────────────────────────────────────────────────
   const tree = useMemo(() => buildTree(allCategories), [allCategories]);

   // rows hiển thị (search → flat; không search → tree)
   const visibleRows = useMemo<CategoryNode[]>(() => {
      if (search) {
         // search mode: flat, tất cả match + ancestors
         return searchTree(tree, search);
      }
      return flattenTree(tree, expandedIds);
   }, [tree, expandedIds, search]);

   // stats client-side
   const rootCount = useMemo(() => tree.length, [tree]);

   // ── expand/collapse helpers ────────────────────────────────────────────────
   const toggleExpand = (id: string) => {
      setExpandedIds((prev) => {
         const next = new Set(prev);
         next.has(id) ? next.delete(id) : next.add(id);
         return next;
      });
   };

   const expandAll = () => {
      const ids = new Set<string>();
      const collect = (nodes: CategoryNode[]) => {
         nodes.forEach((n) => {
            if (n.children.length > 0) {
               ids.add(n.id);
               collect(n.children);
            }
         });
      };
      collect(tree);
      setExpandedIds(ids);
   };

   const collapseAll = () => setExpandedIds(new Set());

   const allExpanded = useMemo(() => {
      let allWithChildren = 0;
      const count = (nodes: CategoryNode[]) => {
         nodes.forEach((n) => {
            if (n.children.length > 0) {
               allWithChildren++;
               count(n.children);
            }
         });
      };
      count(tree);
      return allWithChildren > 0 && expandedIds.size >= allWithChildren;
   }, [tree, expandedIds]);

   // ── handlers ──────────────────────────────────────────────────────────────
   const handleTabChange = (v: StatusTab) => setActiveTab(v);

   const handleSearch = () => setSearch(searchInput);

   const handleClearAll = () => {
      setActiveTab("ALL");
      setSearch("");
      setSearchInput("");
      setSortBy("position");
      setSortOrder("asc");
      setFeaturedFilter("");
   };

   const handleInlineUpdate = useCallback(
      (id: string, patch: Partial<Category>) => {
         setAllCategories((prev) => {
            if (patch.isActive === undefined) {
               return prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
            }

            // isActive thay đổi → cần cascade xuống toàn bộ cây con
            // Build map để tìm children nhanh
            const childrenMap = new Map<string, string[]>();
            prev.forEach((c) => {
               if (c.parentId) {
                  const siblings = childrenMap.get(c.parentId) ?? [];
                  siblings.push(c.id);
                  childrenMap.set(c.parentId, siblings);
               }
            });

            // Collect tất cả descendant ids của node được update
            const affectedIds = new Set<string>([id]);
            const collectDescendants = (parentId: string) => {
               const children = childrenMap.get(parentId) ?? [];
               children.forEach((childId) => {
                  affectedIds.add(childId);
                  collectDescendants(childId);
               });
            };
            collectDescendants(id);

            // Apply patch cho tất cả affected nodes
            return prev.map((c) =>
               affectedIds.has(c.id) ? { ...c, ...patch } : c,
            );
         });
      },
      [],
   );

   const handleDelete = async () => {
      if (!deleteTarget) return;
      setDeleteLoading(true);
      try {
         await softDeleteCategory(deleteTarget.id);
         setDeleteTarget(null);
         fetchCategories();
      } catch (err: any) {
         setError(err?.message ?? "Xóa thất bại");
      } finally {
         setDeleteLoading(false);
      }
   };

   // ── render ────────────────────────────────────────────────────────────────
   return (
      <div className="space-y-5 p-5 bg-neutral-light min-h-full">
         {/* Stats */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
               label="Tổng danh mục"
               value={meta.statusCounts.ALL}
               sub="Tất cả trong hệ thống"
               icon={<Layers size={18} />}
               valueClassName="text-blue-600"
            />
            <StatsCard
               label="Danh mục gốc"
               value={loading ? "—" : rootCount}
               sub="Không có danh mục cha"
               icon={<FolderTree size={18} />}
               valueClassName="text-violet-600"
            />
            <StatsCard
               label="Hoạt động"
               value={meta.statusCounts.active}
               sub="Hiển thị trên website"
               icon={<ChevronRight size={18} />}
               valueClassName="text-emerald-600"
            />
            <StatsCard
               label="Nổi bật"
               value={meta.statusCounts.featured}
               sub="Được đánh dấu nổi bật"
               icon={<Star size={18} />}
               valueClassName="text-amber-600"
            />
         </div>

         {/* Main card */}
         <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
            {/* ── Toolbar ── */}
            <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
               {/* Status tabs */}
               {STATUS_TABS.map((tab) => {
                  const count =
                     tab.value === "ALL"
                        ? meta.statusCounts.ALL
                        : tab.value === "active"
                          ? meta.statusCounts.active
                          : meta.statusCounts.inactive;
                  return (
                     <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                           activeTab === tab.value
                              ? "bg-accent text-white"
                              : "text-primary hover:bg-neutral-light-active"
                        }`}
                     >
                        {tab.label}
                        <span
                           className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                              activeTab === tab.value
                                 ? "bg-white/20 text-white"
                                 : "bg-neutral-light-active text-primary"
                           }`}
                        >
                           {count}
                        </span>
                     </button>
                  );
               })}

               <div className="w-px h-5 bg-neutral mx-1" />

               {/* Search */}
               <div className="relative">
                  <Search
                     size={14}
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50"
                  />
                  <input
                     value={searchInput}
                     onChange={(e) => setSearchInput(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                     placeholder="Tìm tên, slug..."
                     className="pl-9 pr-8 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
                  />
                  {searchInput && (
                     <button
                        onClick={() => {
                           setSearchInput("");
                           setSearch("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary cursor-pointer"
                     >
                        <X size={13} />
                     </button>
                  )}
               </div>

               {hasActiveFilters && (
                  <button
                     onClick={handleClearAll}
                     className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
                  >
                     <X size={13} /> Xoá lọc
                  </button>
               )}

               {/* Right side */}
               <div className="ml-auto flex items-center gap-2">
                  <span className="text-[12px] text-primary/60">
                     {loading
                        ? "..."
                        : `${visibleRows.length} / ${meta.statusCounts.ALL} danh mục`}
                  </span>

                  {/* Expand/Collapse all */}
                  {!search && (
                     <button
                        onClick={allExpanded ? collapseAll : expandAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
                        title={
                           allExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"
                        }
                     >
                        {allExpanded ? (
                           <>
                              <ChevronsDownUp size={13} /> Thu gọn
                           </>
                        ) : (
                           <>
                              <ChevronsUpDown size={13} /> Mở rộng
                           </>
                        )}
                     </button>
                  )}

                  <Link
                     href="/admin/categories/create"
                     className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all shadow-sm"
                  >
                     <Plus size={14} /> Thêm mới
                  </Link>
               </div>
            </div>

            {/* ── Filter row 2 ── */}
            <div className="px-5 py-2.5 border-b border-neutral bg-neutral-light-active/40 flex items-center gap-2 flex-wrap">
               <SlidersHorizontal
                  size={13}
                  className="text-primary/50 shrink-0"
               />
               <span className="text-[11px] text-primary/60 font-medium mr-1">
                  Lọc:
               </span>

               <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className={`px-3 py-1.5 text-[12px] border rounded-lg bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-all ${
                     featuredFilter
                        ? "border-accent text-accent font-medium"
                        : "border-neutral text-primary"
                  }`}
               >
                  {FEATURED_OPTIONS.map((opt) => (
                     <option key={opt.value} value={opt.value}>
                        {opt.label}
                     </option>
                  ))}
               </select>

               <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] text-primary/60">Sắp xếp:</span>
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none cursor-pointer"
                  >
                     {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                           {opt.label}
                        </option>
                     ))}
                  </select>
                  <select
                     value={sortOrder}
                     onChange={(e) =>
                        setSortOrder(e.target.value as "asc" | "desc")
                     }
                     className="px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none cursor-pointer"
                  >
                     <option value="asc">↑ Tăng</option>
                     <option value="desc">↓ Giảm</option>
                  </select>
               </div>
            </div>

            {/* ── Active filter chips ── */}
            {hasActiveFilters && (
               <div className="px-5 py-2 border-b border-neutral flex items-center gap-2 flex-wrap bg-accent/5">
                  <span className="text-[11px] text-primary/60">Đang lọc:</span>
                  {activeTab !== "ALL" && (
                     <Chip
                        label={`Trạng thái: ${activeTab === "active" ? "Hoạt động" : "Ẩn"}`}
                        onRemove={() => setActiveTab("ALL")}
                     />
                  )}
                  {search && (
                     <Chip
                        label={`Tìm: "${search}"`}
                        onRemove={() => {
                           setSearch("");
                           setSearchInput("");
                        }}
                     />
                  )}
                  {featuredFilter && (
                     <Chip
                        label={
                           featuredFilter === "true"
                              ? "Nổi bật"
                              : "Không nổi bật"
                        }
                        onRemove={() => setFeaturedFilter("")}
                     />
                  )}
                  {sortBy !== "position" && (
                     <Chip
                        label={`Sắp xếp: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
                        onRemove={() => setSortBy("position")}
                     />
                  )}
               </div>
            )}

            {/* ── Error ── */}
            {error && (
               <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion/20 text-promotion text-[12px]">
                  <div className="flex items-center gap-2">
                     <AlertCircle size={13} /> {error}
                  </div>
                  <button
                     onClick={fetchCategories}
                     className="flex items-center gap-1 hover:underline cursor-pointer"
                  >
                     <RefreshCw size={11} /> Thử lại
                  </button>
               </div>
            )}

            {/* ── Search mode notice ── */}
            {search && !loading && (
               <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[12px] text-amber-700">
                  <Search size={12} />
                  Đang hiển thị{" "}
                  <span className="font-semibold">
                     {visibleRows.length}
                  </span>{" "}
                  kết quả cho &quot;{search}&quot; — cây danh mục được mở rộng
                  tự động.
               </div>
            )}

            {/* ── Tree Table ── */}
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-neutral-light-active border-b border-neutral">
                        {[
                           "#",
                           "Danh mục",
                           "Cấp",
                           "Danh mục con",
                           "Vị trí",
                           "Trạng thái",
                           "Hành động",
                        ].map((col) => (
                           <th
                              key={col}
                              className="px-4 py-3 text-left text-[11px] font-semibold text-primary/60 uppercase tracking-wider whitespace-nowrap"
                           >
                              {col}
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr>
                           <td colSpan={7} className="py-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-primary">
                                 <Loader2
                                    size={28}
                                    className="animate-spin opacity-40"
                                 />
                                 <span className="text-[13px]">
                                    Đang tải...
                                 </span>
                              </div>
                           </td>
                        </tr>
                     ) : visibleRows.length === 0 ? (
                        <tr>
                           <td colSpan={7} className="py-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-primary">
                                 <FolderTree size={32} className="opacity-30" />
                                 <span className="text-[13px]">
                                    Không có danh mục nào
                                 </span>
                                 {hasActiveFilters && (
                                    <button
                                       onClick={handleClearAll}
                                       className="text-[12px] text-accent hover:underline cursor-pointer"
                                    >
                                       Xóa bộ lọc
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ) : (
                        visibleRows.map((node, idx) => (
                           <TreeRow
                              key={node.id}
                              node={node}
                              idx={idx}
                              isExpanded={expandedIds.has(node.id)}
                              onToggle={toggleExpand}
                              onUpdated={handleInlineUpdate}
                              onDelete={setDeleteTarget}
                           />
                        ))
                     )}
                  </tbody>
               </table>
            </div>

            {/* ── Footer info ── */}
            {!loading && visibleRows.length > 0 && (
               <div className="px-5 py-3 border-t border-neutral flex items-center justify-between">
                  <p className="text-[12px] text-primary/50">
                     Hiển thị{" "}
                     <span className="font-medium text-primary">
                        {visibleRows.length}
                     </span>{" "}
                     / {meta.statusCounts.ALL} danh mục
                     {!search && (
                        <span className="ml-1 text-primary/40">
                           ({tree.length} gốc, {expandedIds.size} đang mở)
                        </span>
                     )}
                  </p>
                  {!search && (
                     <div className="flex items-center gap-3 text-[11px] text-primary/50">
                        <span className="flex items-center gap-1">
                           <span className="w-2.5 h-2.5 rounded-sm bg-blue-50 border border-blue-200 inline-block" />
                           Gốc
                        </span>
                        <span className="flex items-center gap-1">
                           <span className="w-2.5 h-2.5 rounded-sm bg-violet-50 border border-violet-200 inline-block" />
                           Cấp 2
                        </span>
                        <span className="flex items-center gap-1">
                           <span className="w-2.5 h-2.5 rounded-sm bg-rose-50 border border-rose-200 inline-block" />
                           Cấp 3
                        </span>
                     </div>
                  )}
               </div>
            )}
         </div>

         {deleteTarget && (
            <DeleteConfirmModal
               category={deleteTarget}
               onConfirm={handleDelete}
               onCancel={() => setDeleteTarget(null)}
               loading={deleteLoading}
            />
         )}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chip helper
// ─────────────────────────────────────────────────────────────────────────────

function Chip({
   label,
   onRemove,
}: {
   label: string | undefined;
   onRemove: () => void;
}) {
   if (!label) return null;
   return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] text-accent font-medium">
         {label}
         <button
            onClick={onRemove}
            className="hover:text-promotion cursor-pointer ml-0.5"
         >
            <X size={10} />
         </button>
      </span>
   );
}
