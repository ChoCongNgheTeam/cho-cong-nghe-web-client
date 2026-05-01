"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash2, Upload, X, ImageOff, Package, Star, CheckCircle2, EyeOff, Loader2 } from "lucide-react";
import { getBrand, updateBrand, deleteBrand } from "../_libs/brands";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";
import type { Brand } from "../brand.types";
import { formatDate } from "@/helpers";
import { useAdminHref } from "@/hooks/useAdminHref";

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = "bg-accent" }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? color : "bg-neutral"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ── Image picker với live preview ─────────────────────────────────────────────
function ImagePicker({
  currentUrl,
  previewUrl,
  onFileChange,
  onRemove,
}: {
  currentUrl: string | null;
  previewUrl: string | null; // object URL từ file mới chọn
  onFileChange: (file: File) => void;
  onRemove: () => void;
}) {
  // Ưu tiên previewUrl (file vừa chọn) > currentUrl (ảnh từ server)
  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block">Ảnh thương hiệu</label>

      {displayUrl ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-neutral bg-neutral-light-active">
          <Image src={displayUrl} alt="brand" fill className="object-contain p-3" unoptimized />
          <div className="absolute top-2 right-2 flex gap-1.5">
            {/* Đổi ảnh */}
            <label title="Đổi ảnh" className="w-7 h-7 rounded-lg bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors">
              <Upload size={13} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileChange(f);
                  e.target.value = "";
                }}
              />
            </label>
            {/* Xoá ảnh */}
            <button
              type="button"
              title="Xoá ảnh"
              onClick={onRemove}
              className="w-7 h-7 rounded-lg bg-black/40 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={13} />
            </button>
          </div>
          {/* Badge "Ảnh mới" khi đang preview */}
          {previewUrl && <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-semibold">Ảnh mới (chưa lưu)</span>}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-neutral rounded-xl text-neutral-dark hover:bg-neutral-light-active hover:border-accent transition-colors cursor-pointer">
          <Upload size={20} strokeWidth={1.5} />
          <span className="text-[12px]">Chọn ảnh (tùy chọn)</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFileChange(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edit mode — bật nếu URL có ?edit=true
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // edit fields
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);

  // ảnh
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // object URL
  const [removeImage, setRemoveImage] = useState(false);

  // delete
  const deleteModal = usePopzy();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const href = useAdminHref();

  // ── Load brand ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBrand(id)
      .then((res) => {
        setBrand(res.data);
        syncEditFields(res.data);
      })
      .catch((e) => setError(e?.message ?? "Không thể tải thương hiệu"))
      .finally(() => setLoading(false));
  }, [id]);

  const syncEditFields = (b: Brand) => {
    setEditName(b.name);
    setEditDesc(b.description ?? "");
    setEditIsActive(b.isActive);
    setEditIsFeatured(b.isFeatured);
    setImageFile(null);
    setPreviewUrl(null);
    setRemoveImage(false);
  };

  // ── Image handlers ───────────────────────────────────────────────────────────
  const handleFileChange = (file: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false); // nếu chọn ảnh mới thì bỏ flag remove
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageFile(null);
    setRemoveImage(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!brand || !editName.trim()) {
      setSaveError("Tên thương hiệu không được để trống");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await updateBrand(brand.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        isActive: editIsActive,
        isFeatured: editIsFeatured,
        ...(imageFile ? { imageUrl: imageFile } : {}),
        ...(removeImage ? { removeImage: true } : {}),
      });
      setBrand(res.data);
      syncEditFields(res.data);
      setEditMode(false);
    } catch (e: any) {
      setSaveError(e?.message ?? "Không thể cập nhật thương hiệu");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (brand) syncEditFields(brand);
    setEditMode(false);
    setSaveError(null);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!brand) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBrand(brand.id);
      router.push(href(`/brands`));
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá thương hiệu");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy thương hiệu"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

  // currentUrl = ảnh hiện tại trên server (hoặc null nếu đã remove)
  const currentUrl = removeImage ? null : (brand.imageUrl ?? null);

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/brands" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Thương hiệu
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">{brand.name}</span>
      </div>

      {/* ── Main content — căn giữa, max-w-5xl ── */}
      <div className="px-6 py-6 flex justify-center">
        <div className="w-full max-w-5xl flex gap-6 items-start">
          {/* ── Left: ảnh + meta ── */}
          <div className="w-72 shrink-0 space-y-4">
            {editMode ? (
              <div className="bg-neutral-light border border-neutral rounded-xl p-4">
                <ImagePicker currentUrl={currentUrl} previewUrl={previewUrl} onFileChange={handleFileChange} onRemove={handleRemoveImage} />
              </div>
            ) : (
              <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
                {brand.imageUrl ? (
                  <div className="relative w-full h-48">
                    <Image src={brand.imageUrl} alt={brand.name} fill className="object-contain p-4" unoptimized />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-neutral-light-active">
                    <ImageOff size={36} strokeWidth={1.5} className="text-neutral-dark" />
                  </div>
                )}
              </div>
            )}

            {/* Meta card */}
            <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-dark">Sản phẩm</span>
                <span className="font-semibold text-primary">{brand._count.products}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-dark">Ngày tạo</span>
                <span className="text-primary">{formatDate(brand.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-dark">Cập nhật</span>
                <span className="text-primary">{formatDate(brand.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-dark">Slug</span>
                <span className="text-accent font-mono text-[11px]">{brand.slug}</span>
              </div>
            </div>
          </div>

          {/* ── Right: form / view ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header card */}
            <div className="bg-neutral-light border border-neutral rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                {editMode ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-[20px] font-bold text-primary bg-transparent border-b border-accent focus:outline-none w-full"
                    placeholder="Tên thương hiệu"
                  />
                ) : (
                  <h1 className="text-[20px] font-bold text-primary">{brand.name}</h1>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${brand.isActive ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}
                  >
                    {brand.isActive ? <CheckCircle2 size={11} /> : <EyeOff size={11} />}
                    {brand.isActive ? "Hoạt động" : "Ẩn"}
                  </span>
                  {brand.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-500">
                      <Star size={10} /> Nổi bật
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                    >
                      <Pencil size={13} /> Chỉnh sửa
                    </button>
                    {brand._count.products === 0 && (
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          deleteModal.open();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-promotion/30 rounded-lg text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Xoá
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Edit fields */}
            {editMode && (
              <div className="bg-neutral-light border border-neutral rounded-xl p-5 space-y-4">
                {/* Mô tả */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">Mô tả</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    placeholder="Nhập mô tả thương hiệu"
                    className="w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-3">
                  <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
                    <span className="text-[13px] text-primary">Hiển thị</span>
                    <Toggle value={editIsActive} onChange={setEditIsActive} />
                  </div>
                  <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
                    <span className="text-[13px] text-primary">Nổi bật</span>
                    <Toggle value={editIsFeatured} onChange={setEditIsFeatured} color="bg-amber-400" />
                  </div>
                </div>

                {saveError && <div className="px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">{saveError}</div>}
              </div>
            )}

            {/* View mode — description + stats */}
            {!editMode && (
              <div className="bg-neutral-light border border-neutral rounded-xl p-5 space-y-3">
                <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Mô tả</p>
                <p className="text-[14px] text-primary leading-relaxed">{brand.description || <span className="italic text-neutral-dark">Chưa có mô tả</span>}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
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
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá thương hiệu?</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{brand.name}"</p>
            <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
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
                className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {deleting ? "Đang xoá..." : "Xoá thương hiệu"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
