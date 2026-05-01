"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, RotateCcw, Loader2, ImageOff, FolderTree, Star, ChevronRight, AlertCircle, Hash, Layers, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import type { CategoryDetail, CategoryChild } from "../category.types";
import { getCategoryDetail, softDeleteCategory, restoreCategory } from "../_libs/categories";
import { formatDate } from "@/helpers";
import { useAdminHref } from "@/hooks/useAdminHref";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "green" | "orange" | "amber" | "blue" | "violet" | "red" }) {
  const cls: Record<string, string> = {
    neutral: "bg-neutral-light-active text-neutral-dark",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${cls[variant]}`}>{children}</span>;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral last:border-0">
      <span className="text-[12px] text-neutral-dark w-40 shrink-0 pt-0.5">{label}</span>
      <div className="text-[13px] text-primary flex-1 min-w-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-neutral flex items-center justify-between">
        <p className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">{title}</p>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function ChildCard({ child }: { child: CategoryChild }) {
  const imgSrc = child.imageUrl ?? child.imagePath ?? null;
  return (
    <Link href={`/admin/categories/${child.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-neutral hover:border-accent/40 hover:bg-accent/5 transition-all group">
      {imgSrc ? (
        <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-neutral/40 bg-neutral-light-active">
          <Image src={imgSrc} alt={child.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-lg bg-neutral-light-active flex items-center justify-center shrink-0 border border-neutral/30">
          <ImageOff size={14} className="text-neutral-dark/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-primary truncate group-hover:text-accent transition-colors">{child.name}</div>
        <div className="text-[11px] text-neutral-dark font-mono truncate">/{child.slug}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {child._count.children > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-light-active text-neutral-dark">{child._count.children} con</span>}
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${child.isActive ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"}`}>
          {child.isActive ? "Hiện" : "Ẩn"}
        </span>
        <ChevronRight size={13} className="text-neutral-dark/40 group-hover:text-accent transition-colors" />
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const href = useAdminHref();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCategoryDetail(id)
      .then((res: any) => setCategory(res?.data ?? res))
      .catch((e: any) => setError(e?.message ?? "Không thể tải danh mục"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!category) return;
    setActionLoading(true);
    try {
      await softDeleteCategory(category.id);
      router.push(href(`/categories`));
    } catch (e: any) {
      setError(e?.message ?? "Xóa thất bại");
      setConfirmDelete(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!category) return;
    setActionLoading(true);
    try {
      const res: any = await restoreCategory(category.id);
      setCategory((prev) => (prev ? { ...prev, ...(res?.data ?? {}), deletedAt: null } : prev));
    } catch (e: any) {
      setError(e?.message ?? "Khôi phục thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] gap-3 text-neutral-dark">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-[13px]">Đang tải...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 px-4 py-3 bg-promotion-light border border-promotion/20 rounded-xl text-promotion text-[13px]">
          <AlertCircle size={15} /> {error ?? "Không tìm thấy danh mục"}
        </div>
      </div>
    );
  }

  const isDeleted = !!category.deletedAt;
  const imgSrc = category.imageUrl ?? category.imagePath ?? null;
  const hasChildren = category.children.length > 0;

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer">
            <ArrowLeft size={15} className="text-neutral-dark" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[16px] font-semibold text-primary">{category.name}</h1>
              {isDeleted && <Badge variant="red">Đã xóa</Badge>}
              {!isDeleted && category.isFeatured && (
                <Badge variant="amber">
                  <Star size={10} fill="currentColor" /> Nổi bật
                </Badge>
              )}
              {!isDeleted && <Badge variant={category.isActive ? "green" : "orange"}>{category.isActive ? "Hoạt động" : "Ẩn"}</Badge>}
            </div>
            <p className="text-[12px] text-neutral-dark font-mono mt-0.5">/{category.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDeleted ? (
            <button
              onClick={handleRestore}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Khôi phục
            </button>
          ) : (
            <>
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-colors"
              >
                <Pencil size={13} /> Chỉnh sửa
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-promotion text-white text-[13px] font-medium hover:bg-promotion/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} /> Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/20 text-promotion text-[13px]">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Breadcrumb path ── */}
      <div className="flex items-center gap-1.5 text-[12px] text-neutral-dark flex-wrap">
        <Link href="/admin/categories" className="hover:text-accent transition-colors">
          Tất cả danh mục
        </Link>
        {category.parent && (
          <>
            <ChevronRight size={12} />
            <Link href={`/admin/categories/${category.parent.id}`} className="hover:text-accent transition-colors">
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-primary font-medium">{category.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info */}
          <SectionCard title="Thông tin danh mục">
            <InfoRow label="Tên">{category.name}</InfoRow>
            <InfoRow label="Slug">
              <code className="text-[12px] bg-neutral-light-active px-2 py-0.5 rounded-md">/{category.slug}</code>
            </InfoRow>
            {category.description && (
              <InfoRow label="Mô tả">
                <p className="leading-relaxed text-neutral-dark">{category.description}</p>
              </InfoRow>
            )}
            <InfoRow label="Danh mục cha">
              {category.parent ? (
                <Link href={`/admin/categories/${category.parent.id}`} className="inline-flex items-center gap-1.5 text-accent hover:underline">
                  <FolderTree size={12} /> {category.parent.name} <ExternalLink size={11} />
                </Link>
              ) : (
                <Badge variant="blue">
                  <Layers size={11} /> Danh mục gốc
                </Badge>
              )}
            </InfoRow>
            <InfoRow label="Vị trí">
              <span className="inline-flex items-center gap-1 text-[12px]">
                <Hash size={12} className="text-neutral-dark" /> {category.position}
              </span>
            </InfoRow>
            <InfoRow label="Ngày tạo">{formatDate(category.createdAt, { withTime: true })}</InfoRow>
            <InfoRow label="Cập nhật">{formatDate(category.updatedAt, { withTime: true })}</InfoRow>
            {isDeleted && category.deletedAt && (
              <InfoRow label="Đã xóa lúc">
                <span className="text-promotion">{formatDate(category.deletedAt, { withTime: true })}</span>
              </InfoRow>
            )}
          </SectionCard>

          {/* Image */}
          <SectionCard
            title="Hình ảnh"
            action={
              !isDeleted && (
                <Link href={`/admin/categories/${category.id}/edit`} className="text-[12px] text-accent hover:underline">
                  {imgSrc ? "Đổi ảnh" : "Thêm ảnh"}
                </Link>
              )
            }
          >
            <div className="py-4">
              {imgSrc ? (
                <>
                  <div className="relative w-full max-w-xs aspect-video rounded-xl overflow-hidden border border-neutral bg-neutral-light-active">
                    <Image src={imgSrc} alt={category.name} fill className="object-contain" unoptimized />
                  </div>
                  <p className="text-[11px] text-neutral-dark mt-2 font-mono break-all">{imgSrc}</p>
                </>
              ) : (
                <div className="flex items-center gap-3 px-4 py-5 bg-neutral-light-active/60 border border-dashed border-neutral rounded-xl text-neutral-dark/50">
                  <ImageOff size={20} />
                  <span className="text-[13px]">Chưa có hình ảnh</span>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Children */}
          {hasChildren && (
            <SectionCard
              title={`Danh mục con (${category.children.length})`}
              action={
                <Link href={`/admin/categories/create?parentId=${category.id}`} className="text-[12px] text-accent hover:underline">
                  + Thêm con
                </Link>
              }
            >
              <div className="py-3 space-y-2">
                {category.children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </SectionCard>
          )}

          {!hasChildren && !isDeleted && (
            <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-light border border-dashed border-neutral rounded-2xl text-neutral-dark/60">
              <div className="flex items-center gap-2.5 text-[13px]">
                <FolderTree size={16} />
                Chưa có danh mục con
              </div>
              <Link href={`/admin/categories/create?parentId=${category.id}`} className="text-[12px] text-accent hover:underline">
                + Thêm
              </Link>
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-5">
          {/* Status card */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
            <p className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Trạng thái</p>
            {[
              { label: "Hiển thị", active: category.isActive, trueLabel: "Hoạt động", falseLabel: "Ẩn" },
              { label: "Nổi bật", active: category.isFeatured, trueLabel: "Có", falseLabel: "Không" },
              { label: "Tồn tại", active: !isDeleted, trueLabel: "Bình thường", falseLabel: "Đã xóa" },
            ].map(({ label, active, trueLabel, falseLabel }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-neutral last:border-0">
                <span className="text-[12px] text-neutral-dark">{label}</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    active
                      ? label === "Tồn tại"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-emerald-50 text-emerald-700"
                      : label === "Tồn tại"
                        ? "bg-red-50 text-red-600"
                        : "bg-neutral-light-active text-neutral-dark"
                  }`}
                >
                  {active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                  {active ? trueLabel : falseLabel}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
            <p className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Số liệu</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                  <FolderTree size={13} /> Danh mục con
                </span>
                <span className="text-[13px] font-semibold text-primary">{category._count.children}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                  <Hash size={13} /> Vị trí
                </span>
                <span className="text-[13px] font-semibold text-primary">#{category.position}</span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-2">
            <p className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Thao tác nhanh</p>
            {!isDeleted && (
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-colors"
              >
                <Pencil size={14} className="text-neutral-dark" /> Chỉnh sửa
              </Link>
            )}
            <Link
              href={`/admin/categories/create?parentId=${category.id}`}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-colors"
            >
              <FolderTree size={14} className="text-neutral-dark" /> Thêm danh mục con
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-colors"
            >
              <ArrowLeft size={14} className="text-neutral-dark" /> Về danh sách
            </Link>
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-neutral-light border border-neutral rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-promotion-light flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-promotion" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-primary">Xóa danh mục?</p>
                <p className="text-[12px] text-neutral-dark mt-0.5">Có thể khôi phục từ thùng rác</p>
              </div>
            </div>
            {hasChildren && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-[12px]">
                <AlertCircle size={13} />
                Có {category.children.length} danh mục con — cần xóa con trước.
              </div>
            )}
            <p className="text-[13px] bg-neutral-light-active px-3 py-2 rounded-xl border border-neutral font-medium">{category.name}</p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading || hasChildren}
                className="flex-1 px-4 py-2 bg-promotion text-white text-[13px] font-semibold rounded-xl hover:bg-promotion/90 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
