"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Star,
  CheckCircle2,
  EyeOff,
  Loader2,
  ArchiveRestore,
  ShoppingCart,
  ImageOff,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import { getProduct, softDeleteProduct, restoreProduct } from "../_libs/products";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";
import type { ProductDetail, ColorGroup, SpecGroup, ProductVariant } from "../product.types";
import { formatDate, formatVND } from "@/helpers";
import apiRequest from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Comment {
  id: string;
  userId: string;
  content: string;
  targetType: string;
  targetId: string;
  isApproved: boolean;
  createdAt: string;
  user: { id: string; fullName: string; email: string; avatarImage?: string | null };
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: string; fullName: string; avatarImage?: string | null };
  orderItem: {
    id: string;
    quantity: number;
    unitPrice: string | number;
    productVariant: { id: string; code: string; product: { name: string } };
  };
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function groupImagesByColor(imgs: ProductDetail["img"]): ColorGroup[] {
  const map = new Map<string, ColorGroup>();
  for (const img of imgs) {
    if (!map.has(img.color)) map.set(img.color, { color: img.color, images: [] });
    map.get(img.color)!.images.push(img);
  }
  for (const group of map.values()) group.images.sort((a, b) => a.position - b.position);
  return Array.from(map.values());
}

function groupSpecs(specs: ProductDetail["productSpecifications"]): SpecGroup[] {
  const map = new Map<string, SpecGroup>();
  const sorted = [...specs].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const s of sorted) {
    const g = s.specification.group;
    if (!map.has(g)) map.set(g, { groupName: g, items: [] });
    map.get(g)!.items.push(s);
  }
  return Array.from(map.values());
}

function getPriceRange(variants: ProductVariant[]) {
  const active = variants.filter((v) => v.isActive && !v.deletedAt);
  if (!active.length) return { min: 0, max: 0 };
  const prices = active.map((v) => Number(v.price));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function VariantsTable({ variants }: { variants: ProductVariant[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-neutral">
            <th className="text-left py-2 px-3 font-semibold text-neutral-dark">SKU</th>
            <th className="text-left py-2 px-3 font-semibold text-neutral-dark">Thuộc tính</th>
            <th className="text-right py-2 px-3 font-semibold text-neutral-dark">Giá</th>
            <th className="text-right py-2 px-3 font-semibold text-neutral-dark">Tồn</th>
            <th className="text-right py-2 px-3 font-semibold text-neutral-dark">Bán</th>
            <th className="text-center py-2 px-3 font-semibold text-neutral-dark">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => {
            const attrs = v.variantAttributes?.map((a) => a.attributeOption.value).join(" · ") ?? "";
            const isDeleted = !!v.deletedAt;
            return (
              <tr key={v.id} className={`border-b border-neutral/40 ${isDeleted ? "opacity-40" : "hover:bg-neutral-light-active/50"}`}>
                <td className="py-2 px-3 font-mono text-[11px] text-accent">{v.code}</td>
                <td className="py-2 px-3 text-primary">{attrs || <span className="text-neutral-dark italic">Default</span>}</td>
                <td className="py-2 px-3 text-right font-semibold">{formatVND(Number(v.price))}</td>
                <td className="py-2 px-3 text-right">{v.quantity}</td>
                <td className="py-2 px-3 text-right">{v.soldCount}</td>
                <td className="py-2 px-3 text-center">
                  {isDeleted ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-500">Đã xóa</span>
                  ) : v.isActive ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-orange-500">Ẩn</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-neutral-light-active transition-colors cursor-pointer">
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">{title}</p>
        {open ? <ChevronUp size={14} className="text-neutral-dark" /> : <ChevronDown size={14} className="text-neutral-dark" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function StarRow({ rating, count, total }: { rating: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="w-4 text-right text-neutral-dark">{rating}</span>
      <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-neutral rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-neutral-dark">{count}</span>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    APPROVED: { label: "Đã duyệt", cls: "bg-emerald-50 text-emerald-600" },
    PENDING: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-600" },
    REJECTED: { label: "Từ chối", cls: "bg-red-50 text-red-500" },
  };
  const c = cfg[status] ?? cfg.PENDING;
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${c.cls}`}>{c.label}</span>;
}

function UserAvatar({ user }: { user: { fullName: string; avatarImage?: string | null } }) {
  return user.avatarImage ? (
    <Image src={user.avatarImage} alt={user.fullName} width={28} height={28} className="rounded-full object-cover shrink-0" unoptimized />
  ) : (
    <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[11px] font-bold shrink-0">{user.fullName?.[0]?.toUpperCase() ?? "U"}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS: Comments + Reviews
// ─────────────────────────────────────────────────────────────────────────────

function CommentsTab({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get<any>("/comments", {
        params: { targetType: "PRODUCT", targetId: productId, limit: 50, sortOrder: "desc" },
      });
      // Response: { data: [...], pagination: { total, ... } }
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      const tot = res.pagination?.total ?? data.length;
      setComments(data);
      setTotal(tot);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={18} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-neutral-dark">{total} bình luận</p>
        <button onClick={load} className="flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer">
          <RefreshCw size={11} /> Làm mới
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <MessageSquare size={28} className="text-neutral-dark opacity-30" />
          <p className="text-[13px] text-neutral-dark">Chưa có bình luận nào</p>
        </div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5 py-2.5 border-b border-neutral/50 last:border-0">
            <UserAvatar user={c.user} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-semibold text-primary">{c.user.fullName}</span>
                <span className="text-[11px] text-neutral-dark">{c.user.email}</span>
                {c.isApproved ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                    <ThumbsUp size={9} /> Đã duyệt
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                    <Clock size={9} /> Chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-[13px] text-primary mt-0.5 leading-relaxed">{c.content}</p>
              <p className="text-[11px] text-neutral-dark mt-0.5">{formatDate(c.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ReviewsTab({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest.get<any>(`/reviews/product/${productId}`);
      // Response: { data: Review[], stats: { average, total, distribution }, total }
      const data = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      setReviews(data);
      if (res.stats) setStats(res.stats);
      else {
        // Fallback: tính stats từ data
        const total = data.length;
        const avg = total > 0 ? data.reduce((s: number, r: Review) => s + r.rating, 0) / total : 0;
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of data) if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
        setStats({ average: parseFloat(avg.toFixed(2)), total, distribution: dist });
      }
    } catch {
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={18} className="animate-spin text-accent" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      {stats && stats.total > 0 && (
        <div className="flex items-start gap-6 p-4 rounded-xl bg-neutral-light-active border border-neutral">
          <div className="text-center shrink-0">
            <p className="text-[32px] font-black text-amber-500">{stats.average.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} className={s <= Math.round(stats.average) ? "text-amber-400 fill-amber-400" : "text-neutral"} />
              ))}
            </div>
            <p className="text-[11px] text-neutral-dark mt-0.5">{stats.total} đánh giá</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((r) => (
              <StarRow key={r} rating={r} count={stats.distribution[r] ?? 0} total={stats.total} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[12px] text-neutral-dark">{stats?.total ?? 0} đánh giá được duyệt</p>
        <button onClick={load} className="flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer">
          <RefreshCw size={11} /> Làm mới
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Star size={28} className="text-neutral-dark opacity-30" />
          <p className="text-[13px] text-neutral-dark">Chưa có đánh giá nào được duyệt</p>
        </div>
      ) : (
        <div className="space-y-1">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-2.5 py-3 border-b border-neutral/50 last:border-0">
              <UserAvatar user={r.user} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-semibold text-primary">{r.user.fullName}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-neutral"} />
                    ))}
                  </div>
                  <ReviewStatusBadge status={r.isApproved} />
                </div>
                <p className="text-[11px] text-neutral-dark mt-0.5">
                  {r.orderItem.productVariant.code} · Số lượng: {r.orderItem.quantity} · {formatVND(Number(r.orderItem.unitPrice))}
                </p>
                {r.comment && <p className="text-[13px] text-primary mt-1 leading-relaxed">{r.comment}</p>}
                <p className="text-[11px] text-neutral-dark mt-0.5">{formatDate(r.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO SECTION — collapsible card dùng trong tab "Thông tin sản phẩm"
// ─────────────────────────────────────────────────────────────────────────────

function InfoSection({ title, children, defaultOpen = true, action }: { title: string; children: React.ReactNode; defaultOpen?: boolean; action?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-neutral rounded-xl overflow-hidden bg-neutral-light">
      {/* Header — click để toggle */}
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-light-active transition-colors cursor-pointer">
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">{title}</p>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {action}
          <span
            className="text-neutral-dark"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </button>
      {/* Body */}
      {open && <div className="px-4 pb-4 pt-2">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

type MainTab = "info" | "comments" | "reviews";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("info");
  const [commentCount, setCommentCount] = useState<number | null>(null);

  const deleteModal = usePopzy();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const restoreModal = usePopzy();
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((res) => {
        setProduct(res.data);
        const colors = [...new Set(res.data.img.map((i) => i.color))];
        if (colors.length) setSelectedColor(colors[0]);
        // Load comment count song song để hiển thị số lượng trên tab "Bình luận"
        apiRequest
          .get<any>("/comments", {
            params: { targetType: "PRODUCT", targetId: res.data.id, limit: 1 },
          })
          .then((cr) => {
            setCommentCount(cr.pagination?.total ?? (Array.isArray(cr.data) ? cr.data.length : 0));
          })
          .catch(() => {});
      })
      .catch((e) => setError(e?.message ?? "Không thể tải sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  const colorGroups = useMemo(() => (product ? groupImagesByColor(product.img) : []), [product]);
  const specGroups = useMemo(() => (product ? groupSpecs(product.productSpecifications) : []), [product]);
  const highlightSpecs = useMemo(() => product?.productSpecifications.filter((s) => s.isHighlight) ?? [], [product]);
  const priceRange = useMemo(() => (product ? getPriceRange(product.variants) : { min: 0, max: 0 }), [product]);
  const activeVariants = useMemo(() => product?.variants.filter((v) => v.isActive && !v.deletedAt) ?? [], [product]);
  const selectedImages = useMemo(() => {
    if (!selectedColor || !colorGroups.length) return [];
    return colorGroups.find((g) => g.color === selectedColor)?.images ?? colorGroups[0]?.images ?? [];
  }, [selectedColor, colorGroups]);
  const thumbnail = selectedImages[0]?.imageUrl ?? null;

  const handleDeleteConfirm = async () => {
    if (!product) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await softDeleteProduct(product.id);
      router.push("/admin/products");
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!product) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const res = await restoreProduct(product.id);
      setProduct(res.data);
      restoreModal.close();
    } catch (e: any) {
      setRestoreError(e?.message ?? "Không thể khôi phục sản phẩm");
    } finally {
      setRestoring(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );

  if (error || !product)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy sản phẩm"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          Quay lại
        </button>
      </div>
    );

  const isDeleted = !!product.deletedAt;
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark">/</span>
        <Link href="/admin/products" className="text-[13px] text-neutral-dark hover:text-accent">
          Sản phẩm
        </Link>
        <span className="text-neutral-dark">/</span>
        <span className="text-[13px] text-primary font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Deleted banner */}
      {isDeleted && (
        <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <Trash2 size={16} className="text-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-red-700">Sản phẩm đã được chuyển vào thùng rác</p>
            <p className="text-[11px] text-red-500">Xóa lúc: {formatDate(product.deletedAt!)} — Không hiển thị cho khách hàng</p>
          </div>
          <button
            onClick={() => {
              setRestoreError(null);
              restoreModal.open();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-[12px] font-medium text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0"
          >
            <ArchiveRestore size={13} /> Khôi phục
          </button>
        </div>
      )}

      <div className="px-6 py-4 flex justify-center">
        <div className="w-full max-w-6xl flex gap-6 items-start">
          {/* LEFT SIDEBAR */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Image */}
            <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
              <div className="relative w-full h-56 bg-neutral-light-active">
                {thumbnail ? (
                  <Image src={thumbnail} alt={product.name} fill className="object-contain p-4" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={36} strokeWidth={1.5} className="text-neutral-dark" />
                  </div>
                )}
              </div>
              {selectedImages.length > 1 && (
                <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto">
                  {selectedImages.slice(0, 5).map((img) => (
                    <div key={img.id} className="w-10 h-10 rounded-md overflow-hidden border border-neutral shrink-0 bg-neutral-light-active">
                      {img.imageUrl && <Image src={img.imageUrl} alt={img.altText ?? img.color} width={40} height={40} className="object-contain" unoptimized />}
                    </div>
                  ))}
                  {selectedImages.length > 5 && (
                    <div className="w-10 h-10 rounded-md border border-neutral bg-neutral-light-active flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-neutral-dark">+{selectedImages.length - 5}</span>
                    </div>
                  )}
                </div>
              )}
              {colorGroups.length > 1 && (
                <div className="px-3 pb-3 space-y-1.5">
                  <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Màu sắc ({colorGroups.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorGroups.map((group) => (
                      <button
                        key={group.color}
                        onClick={() => setSelectedColor(group.color)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border cursor-pointer transition-colors ${selectedColor === group.color ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"}`}
                      >
                        {group.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-3 text-[13px]">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Thông tin</p>
              {[
                { label: "Thương hiệu", value: product.brand.name },
                { label: "Danh mục", value: <span className="font-mono text-[11px] text-accent">{product.category.slug}</span> },
                { label: "Variant display", value: <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-light-active text-primary">{product.variantDisplay}</span> },
                {
                  label: "Đánh giá",
                  value: (
                    <span className="text-amber-500 font-medium">
                      ★ {Number(product.ratingAverage).toFixed(1)}
                      <span className="text-neutral-dark"> ({product.ratingCount})</span>
                    </span>
                  ),
                },
                { label: "Lượt xem", value: <span className="font-semibold">{Number(product.viewsCount).toLocaleString()}</span> },
                { label: "Tổng đã bán", value: <span className="font-semibold">{product.totalSoldCount}</span> },
                { label: "Ngày tạo", value: <span className="text-[12px]">{formatDate(product.createdAt)}</span> },
                { label: "Cập nhật", value: <span className="text-[12px]">{formatDate(product.updatedAt)}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-neutral-dark shrink-0">{label}</span>
                  <span className="text-primary text-right">{value}</span>
                </div>
              ))}
              <div className="flex items-start justify-between gap-2">
                <span className="text-neutral-dark shrink-0">Slug</span>
                <span className="text-accent font-mono text-[11px] break-all text-right">{product.slug}</span>
              </div>
            </div>

            {/* Highlight specs */}
            {highlightSpecs.length > 0 && (
              <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-2">Thông số nổi bật ({highlightSpecs.length})</p>
                {highlightSpecs.map((s) => (
                  <div key={s.specificationId} className="flex items-center justify-between text-[12px]">
                    <span className="text-neutral-dark">{s.specification.name}</span>
                    <span className="font-medium text-primary">
                      {s.value}
                      {s.specification.unit ? ` ${s.specification.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT MAIN */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="bg-neutral-light border border-neutral rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-[18px] font-bold text-primary leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${isDeleted ? "bg-red-50 text-red-500" : product.isActive ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}
                  >
                    {isDeleted ? (
                      <>
                        <Trash2 size={10} /> Đã xóa
                      </>
                    ) : product.isActive ? (
                      <>
                        <CheckCircle2 size={11} /> Hiển thị
                      </>
                    ) : (
                      <>
                        <EyeOff size={11} /> Ẩn
                      </>
                    )}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-500">
                      <Star size={10} /> Nổi bật
                    </span>
                  )}
                  {defaultVariant && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent">
                      <ShoppingCart size={10} />
                      {priceRange.min === priceRange.max ? formatVND(priceRange.min) : `${formatVND(priceRange.min)} – ${formatVND(priceRange.max)}`}
                    </span>
                  )}
                  <span className="text-[11px] text-neutral-dark">
                    {product.variants.filter((v) => !v.deletedAt).length} variants · {colorGroups.length} màu
                  </span>
                </div>
              </div>
              {!isDeleted && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer"
                  >
                    <Pencil size={13} /> Chỉnh sửa
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteError(null);
                      deleteModal.open();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-promotion/30 rounded-lg text-[13px] text-promotion hover:bg-promotion-light cursor-pointer"
                  >
                    <Trash2 size={13} /> Xoá
                  </button>
                </div>
              )}
            </div>

            {/* ── TABS ── */}
            <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
              <div className="flex border-b border-neutral">
                {(
                  [
                    { key: "info", label: "Thông tin sản phẩm" },
                    { key: "reviews", label: `Đánh giá (${product.ratingCount})` },
                    { key: "comments", label: commentCount !== null ? `Bình luận (${commentCount})` : "Bình luận" },
                  ] as { key: MainTab; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.key ? "border-accent text-accent" : "border-transparent text-neutral-dark hover:text-primary"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* ── TAB: Info ── */}
                {activeTab === "info" && (
                  <div className="space-y-3">
                    {/* Section: Mô tả — defaultOpen */}
                    <InfoSection
                      title="Mô tả sản phẩm"
                      defaultOpen={false}
                      action={
                        !isDeleted && !product.description ? (
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer">
                            <Pencil size={11} /> Thêm mô tả
                          </Link>
                        ) : undefined
                      }
                    >
                      {product.description ? (
                        <div
                          className="text-[14px] text-primary leading-relaxed prose prose-sm max-w-none
                          prose-headings:text-primary prose-headings:font-semibold
                          prose-p:text-primary/90 prose-strong:text-primary
                          prose-a:text-accent prose-code:text-accent prose-code:bg-neutral-light-active prose-code:px-1 prose-code:rounded"
                          dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                      ) : (
                        <p className="text-[13px] italic text-neutral-dark">Chưa có mô tả</p>
                      )}
                    </InfoSection>

                    {/* Section: Biến thể — thu gọn mặc định */}
                    <InfoSection
                      title={`Biến thể (${product.variants.length})`}
                      defaultOpen={true}
                      action={
                        !isDeleted ? (
                          <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer">
                            <Pencil size={11} /> Sửa
                          </Link>
                        ) : undefined
                      }
                    >
                      <VariantsTable variants={product.variants} />
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-neutral-dark">
                        <span>
                          Active: <strong className="text-emerald-600">{activeVariants.length}</strong>
                        </span>
                        <span>
                          Giá từ: <strong className="text-accent">{formatVND(priceRange.min)}</strong>
                        </span>
                        {priceRange.min !== priceRange.max && (
                          <span>
                            Đến: <strong className="text-accent">{formatVND(priceRange.max)}</strong>
                          </span>
                        )}
                      </div>
                    </InfoSection>

                    {/* Section: Thông số — thu gọn mặc định */}
                    {specGroups.length > 0 && (
                      <InfoSection title={`Thông số kỹ thuật (${product.productSpecifications.length})`} defaultOpen={false}>
                        <div className="space-y-4">
                          {specGroups.map((group) => (
                            <div key={group.groupName}>
                              <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">{group.groupName}</p>
                              <div className="space-y-1">
                                {group.items.map((s) => (
                                  <div
                                    key={s.specificationId}
                                    className={`flex items-start justify-between gap-3 px-3 py-1.5 rounded-lg text-[12px] ${s.isHighlight ? "bg-amber-50 border border-amber-200/50" : "bg-neutral-light-active"}`}
                                  >
                                    <span className="text-neutral-dark shrink-0 max-w-[200px]">
                                      {s.isHighlight && <span className="text-amber-500 mr-1">★</span>}
                                      {s.specification.name}
                                    </span>
                                    <span className="font-medium text-primary text-right">
                                      {s.value}
                                      {s.specification.unit ? ` ${s.specification.unit}` : ""}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </InfoSection>
                    )}
                  </div>
                )}

                {/* ── TAB: Reviews ── */}
                {activeTab === "reviews" && <ReviewsTab productId={product.id} />}

                {/* ── TAB: Comments ── */}
                {activeTab === "comments" && <CommentsTab productId={product.id} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Popzy
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        footer={false}
        closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
              <Trash2 size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá sản phẩm?</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-2">"{product.name}"</p>
            <p className="text-[12px] text-neutral-dark text-center mb-6">Sản phẩm sẽ được chuyển vào thùng rác.</p>
            {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
            <div className="flex gap-2">
              <button
                onClick={deleteModal.close}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
              </button>
            </div>
          </div>
        }
      />

      {/* Restore Modal */}
      <Popzy
        isOpen={restoreModal.isOpen}
        onClose={restoreModal.close}
        footer={false}
        closeMethods={restoring ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <ArchiveRestore size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Khôi phục sản phẩm?</h3>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{product.name}"</p>
            <p className="text-[12px] text-neutral-dark text-center mb-6">Sản phẩm sẽ được khôi phục nhưng vẫn ở trạng thái ẩn.</p>
            {restoreError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{restoreError}</div>}
            <div className="flex gap-2">
              <button
                onClick={restoreModal.close}
                disabled={restoring}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoring}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                {restoring && <Loader2 size={13} className="animate-spin" />}
                {restoring ? "Đang khôi phục..." : "Khôi phục"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
