"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2, Package, Star, CheckCircle2, EyeOff, Loader2, ArchiveRestore, ShoppingCart, ImageOff, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { getProduct, softDeleteProduct, restoreProduct } from "../_libs/products";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";
import type { ProductDetail, ColorGroup, SpecGroup, ProductVariant } from "../product.types";
import { formatDate, formatVND } from "@/helpers";

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
            const attrs = v.variantAttributes.map((va) => va.attributeOption.label).join(" / ");
            const isDeleted = !!v.deletedAt;
            return (
              <tr key={v.id} className={`border-b border-neutral/50 ${isDeleted ? "opacity-40" : ""} ${v.isDefault ? "bg-accent/5" : ""}`}>
                <td className="py-2 px-3 font-mono text-[11px] text-neutral-dark">
                  {v.code ?? "—"}
                  {v.isDefault && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent font-semibold">default</span>}
                </td>
                <td className="py-2 px-3 text-primary">{attrs || "—"}</td>
                <td className="py-2 px-3 text-right font-semibold text-accent">{formatVND(Number(v.price))}</td>
                <td className="py-2 px-3 text-right text-primary">{v.quantity}</td>
                <td className="py-2 px-3 text-right text-neutral-dark">{v.soldCount}</td>
                <td className="py-2 px-3 text-center">
                  {isDeleted ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-50 text-red-500">Đã xóa</span>
                  ) : v.isActive ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600">Active</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-orange-50 text-orange-500">Ẩn</span>
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

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const deleteModal = usePopzy();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const restoreModal = usePopzy();
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then((res) => {
        setProduct(res.data);
        const colors = [...new Set(res.data.img.map((i) => i.color))];
        if (colors.length) setSelectedColor(colors[0]);
      })
      .catch((e) => setError(e?.message ?? "Không thể tải sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived ─────────────────────────────────────────────────────────────────

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

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy sản phẩm"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

  const isDeleted = !!product.deletedAt;
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/products" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Sản phẩm
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* ── Deleted banner ── */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400 text-[12px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
          >
            <ArchiveRestore size={13} /> Khôi phục
          </button>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="px-6 py-4 flex justify-center">
        <div className="w-full max-w-6xl flex gap-6 items-start">
          {/* ── LEFT SIDEBAR ── */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Image gallery */}
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
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                          selectedColor === group.color ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"
                        }`}
                      >
                        {group.color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meta card */}
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
                      ★ {Number(product.ratingAverage).toFixed(1)} <span className="text-neutral-dark">({product.ratingCount})</span>
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
                    <span className="font-medium text-primary text-right max-w-[130px] truncate">
                      {s.value}
                      {s.specification.unit ? ` ${s.specification.unit}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT MAIN ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header card — actions */}
            <div className="bg-neutral-light border border-neutral rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-[18px] font-bold text-primary leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isDeleted ? "bg-red-50 text-red-500" : product.isActive ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"
                    }`}
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

              {/* Action buttons — chỉ navigate, không inline edit */}
              {!isDeleted && (
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                  >
                    <Pencil size={13} /> Chỉnh sửa
                  </Link>
                  <button
                    onClick={() => {
                      setDeleteError(null);
                      deleteModal.open();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-promotion/30 rounded-lg text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} /> Xoá
                  </button>
                </div>
              )}
            </div>

            {/* Description — render HTML từ CKEditor */}
            <Section title="Mô tả sản phẩm" defaultOpen={false}>
              {product.description ? (
                <div
                  className="mt-3 text-[14px] text-primary leading-relaxed prose prose-sm max-w-none
                    prose-headings:text-primary prose-headings:font-semibold
                    prose-p:text-primary/90 prose-p:leading-relaxed
                    prose-strong:text-primary prose-strong:font-semibold
                    prose-ul:text-primary/90 prose-ol:text-primary/90
                    prose-li:leading-relaxed prose-li:my-0.5
                    prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-accent/40 prose-blockquote:text-primary/70
                    prose-code:text-accent prose-code:bg-neutral-light-active prose-code:px-1 prose-code:rounded
                    prose-pre:bg-neutral-light-active prose-pre:border prose-pre:border-neutral prose-pre:rounded-xl
                    prose-table:text-[13px] prose-th:bg-neutral-light-active prose-th:text-primary
                    prose-img:rounded-xl prose-img:border prose-img:border-neutral"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[13px] italic text-neutral-dark">Chưa có mô tả</p>
                  <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer">
                    <Pencil size={11} /> Thêm mô tả
                  </Link>
                </div>
              )}
            </Section>

            {/* Variants */}
            <Section title={`Biến thể (${product.variants.length})`}>
              <div className="mt-2">
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
                  {!isDeleted && (
                    <Link href={`/admin/products/${product.id}/edit`} className="ml-auto flex items-center gap-1 text-accent hover:underline cursor-pointer">
                      <Pencil size={10} /> Sửa variants
                    </Link>
                  )}
                </div>
              </div>
            </Section>

            {/* Specifications */}
            {specGroups.length > 0 && (
              <Section title={`Thông số kỹ thuật (${product.productSpecifications.length})`} defaultOpen={false}>
                <div className="mt-3 space-y-4">
                  {specGroups.map((group) => (
                    <div key={group.groupName}>
                      <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">{group.groupName}</p>
                      <div className="space-y-1">
                        {group.items.map((s) => (
                          <div
                            key={s.specificationId}
                            className={`flex items-start justify-between gap-3 px-3 py-1.5 rounded-lg text-[12px] ${
                              s.isHighlight ? "bg-amber-50 border border-amber-200/50" : "bg-neutral-light-active"
                            }`}
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
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Modal ── */}
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
            <p className="text-[12px] text-neutral-dark text-center mb-6">Sản phẩm sẽ được chuyển vào thùng rác. Bạn có thể khôi phục sau.</p>
            {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
            <div className="flex gap-2">
              <button
                onClick={deleteModal.close}
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

      {/* ── Restore Modal ── */}
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
            <p className="text-[13px] text-primary/60 text-center mb-1">Khôi phục</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{product.name}"</p>
            <p className="text-[12px] text-neutral-dark text-center mb-6">Sản phẩm sẽ được khôi phục nhưng vẫn ở trạng thái ẩn. Bạn cần bật lại để hiển thị cho khách hàng.</p>
            {restoreError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{restoreError}</div>}
            <div className="flex gap-2">
              <button
                onClick={restoreModal.close}
                disabled={restoring}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoring}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
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
