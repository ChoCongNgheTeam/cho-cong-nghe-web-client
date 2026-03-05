"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
   ArrowLeft,
   ImageOff,
   Pencil,
   Trash2,
   Package,
   Calendar,
   RefreshCw,
   Star,
   CheckCircle2,
   EyeOff,
   ExternalLink,
   MoreHorizontal,
   X,
   Save,
   Upload,
} from "lucide-react";
import { Brand } from "../brand.types";
import { deleteBrand, getBrand, updateBrand } from "../_libs";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";

function BrandImage({
   brand,
   previewUrl,
}: {
   brand: Brand;
   previewUrl?: string | null;
}) {
   const [imgError, setImgError] = useState(false);
   const src = previewUrl ?? brand.imageUrl ?? brand.imagePath ?? null;

   if (src && !imgError) {
      return (
         <div className="relative w-full h-full">
            <Image
               src={src}
               alt={brand.name}
               fill
               className="object-contain p-3"
               onError={() => setImgError(true)}
               unoptimized
            />
         </div>
      );
   }

   return (
      <div className="w-full h-full flex items-center justify-center text-primary/40">
         <ImageOff size={36} strokeWidth={1} />
      </div>
   );
}

function Skeleton() {
   return (
      <div className="min-h-screen bg-neutral-light px-6 py-5 animate-pulse">
         <div className="h-8 w-24 bg-neutral rounded-lg mb-6" />
         <div className="flex gap-6">
            <div className="w-72 shrink-0 space-y-4">
               <div className="h-64 bg-neutral rounded-2xl" />
               <div className="h-32 bg-neutral rounded-2xl" />
            </div>
            <div className="flex-1 space-y-4">
               <div className="h-40 bg-neutral rounded-2xl" />
               <div className="h-48 bg-neutral rounded-2xl" />
            </div>
         </div>
      </div>
   );
}

function StatCard({
   icon,
   label,
   value,
   sub,
   accent,
}: {
   icon: React.ReactNode;
   label: string;
   value: React.ReactNode;
   sub?: string;
   accent?: string;
}) {
   return (
      <div className="bg-neutral-light border border-neutral rounded-2xl p-4 flex items-start gap-3 hover:border-neutral-dark/20 hover:shadow-sm transition-all">
         <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent ?? "bg-neutral-light-active text-primary"}`}
         >
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-[11px] font-medium text-primary uppercase tracking-wider mb-0.5">
               {label}
            </p>
            <div className="text-[14px] font-semibold text-primary leading-tight">
               {value}
            </div>
            {sub && <p className="text-[11px] text-primary mt-0.5">{sub}</p>}
         </div>
      </div>
   );
}

function EditField({
   label,
   children,
}: {
   label: string;
   children: React.ReactNode;
}) {
   return (
      <div className="space-y-1.5">
         <label className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            {label}
         </label>
         {children}
      </div>
   );
}

const inputCls =
   "w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

export default function AdminBrand() {
   const { id } = useParams<{ id: string }>();
   const router = useRouter();
   const searchParams = useSearchParams();
   const [brand, setBrand] = useState<Brand | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [menuOpen, setMenuOpen] = useState(false);

   // ── Edit state ──
   const [isEditing, setIsEditing] = useState(false);
   const [saving, setSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);

   const [editName, setEditName] = useState("");
   const [editDescription, setEditDescription] = useState("");
   const [editIsActive, setEditIsActive] = useState(false);
   const [editIsFeatured, setEditIsFeatured] = useState(false);
   const [editImageFile, setEditImageFile] = useState<File | null>(null);
   const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
   const [editRemoveImage, setEditRemoveImage] = useState(false);

   // Delete state
   const deleteModal = usePopzy();
   const [deleting, setDeleting] = useState(false);
   const [deleteError, setDeleteError] = useState<string | null>(null);

   useEffect(() => {
      if (!id) return;
      setLoading(true);
      setError(null);
      getBrand(id)
         .then((res) => {
            const data = res.data;
            setBrand(data);
            if (searchParams.get("edit") === "true") {
               setEditName(data.name);
               setEditDescription(data.description ?? "");
               setEditIsActive(data.isActive);
               setEditIsFeatured(data.isFeatured);
               setIsEditing(true);
               router.replace(`/admin/brands/${id}`);
            }
         })
         .catch((err) => setError(err?.message || "Không thể tải thương hiệu"))
         .finally(() => setLoading(false));
   }, [id]);

   const openEdit = () => {
      if (!brand) return;
      setEditName(brand.name);
      setEditDescription(brand.description ?? "");
      setEditIsActive(brand.isActive);
      setEditIsFeatured(brand.isFeatured);
      setEditImageFile(null);
      setEditPreviewUrl(null);
      setEditRemoveImage(false);
      setSaveError(null);
      setIsEditing(true);
   };

   const cancelEdit = () => {
      setIsEditing(false);
      setSaveError(null);
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
      setEditPreviewUrl(null);
      setEditImageFile(null);
   };

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
      setEditImageFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
      setEditRemoveImage(false);
   };

   const handleSave = async () => {
      if (!brand) return;
      setSaving(true);
      setSaveError(null);
      try {
         const res = await updateBrand(brand.id, {
            name: editName,
            description: editDescription,
            isActive: editIsActive,
            isFeatured: editIsFeatured,
            ...(editRemoveImage ? { removeImage: true } : {}),
            ...(editImageFile ? { imageUrl: editImageFile } : {}),
         });
         setBrand(res.data);
         setIsEditing(false);
         if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
         setEditPreviewUrl(null);
      } catch (err: any) {
         setSaveError(err?.message || "Không thể lưu thay đổi");
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async () => {
      if (!brand) return;
      setDeleting(true);
      setDeleteError(null);
      try {
         await deleteBrand(brand.id);
         deleteModal.close();
         router.push("/admin/brands");
      } catch (err: any) {
         setDeleteError(err?.message || "Không thể xoá thương hiệu");
      } finally {
         setDeleting(false);
      }
   };

   if (loading) return <Skeleton />;
   if (error || !brand) {
      return (
         <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion">
               <ImageOff size={24} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-primary">
               {error ?? "Không tìm thấy thương hiệu"}
            </p>
            <button
               onClick={() => router.back()}
               className="text-[13px] text-primary cursor-pointer"
            >
               ← Quay lại
            </button>
         </div>
      );
   }

   const createdDate = new Date(brand.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });
   const updatedDate = new Date(brand.updatedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   });
   const updatedTime = new Date(brand.updatedAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
   });

   return (
      <div className="min-h-screen bg-neutral-light font-inters">
         <Popzy
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.close}
            footer={false}
            closeMethods={["button", "overlay", "escape"]}
            content={
               <div className="py-2">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                     <Trash2 size={22} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[16px] font-bold text-primary text-center mb-1">
                     Xoá thương hiệu?
                  </h3>
                  <p className="text-[13px] text-primary/60 text-center mb-1">
                     Bạn có chắc chắn muốn xoá
                  </p>
                  <p className="text-[14px] font-semibold text-primary text-center mb-5">
                     "{brand.name}"
                  </p>
                  <p className="text-[12px] text-promotion text-center mb-6">
                     Hành động này không thể hoàn tác.
                  </p>

                  {deleteError && (
                     <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">
                        {deleteError}
                     </div>
                  )}

                  <div className="flex gap-2">
                     <button
                        onClick={deleteModal.close}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
                     >
                        Huỷ
                     </button>
                     <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
                     >
                        {deleting ? "Đang xoá..." : "Xoá thương hiệu"}
                     </button>
                  </div>
               </div>
            }
         />

         {/* ── Sticky top bar ── */}
         <div className="sticky top-0 z-10 bg-neutral-light/80 backdrop-blur-sm border-b border-neutral px-6 py-3 flex items-center justify-between">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-1.5 text-[13px] text-primary cursor-pointer"
            >
               <ArrowLeft size={14} /> Thương hiệu
            </button>

            <div className="flex items-center gap-2">
               {isEditing ? (
                  <>
                     <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-neutral bg-neutral-light hover:bg-neutral-light-active text-primary text-[13px] font-medium rounded-xl transition-colors cursor-pointer"
                     >
                        <X size={13} /> Huỷ
                     </button>
                     <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                     >
                        <Save size={13} strokeWidth={2.5} />
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                     </button>
                  </>
               ) : (
                  <>
                     <button
                        onClick={openEdit}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                     >
                        <Pencil size={13} strokeWidth={2.5} /> Chỉnh sửa
                     </button>

                     <div className="relative">
                        <button
                           onClick={() => setMenuOpen((v) => !v)}
                           className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral bg-neutral-light hover:bg-neutral-light-active text-primary transition-colors cursor-pointer"
                        >
                           <MoreHorizontal size={15} />
                        </button>
                        {menuOpen && (
                           <>
                              <div
                                 className="fixed inset-0 z-10"
                                 onClick={() => setMenuOpen(false)}
                              />
                              <div className="absolute right-0 top-full mt-1.5 z-20 w-48 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                                 <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                                    <ExternalLink size={13} /> Xem ngoài shop
                                 </button>
                                 <div className="h-px bg-neutral mx-2" />
                                 {/* ✅ Mở modal xoá */}
                                 <button
                                    onClick={() => {
                                       setMenuOpen(false);
                                       deleteModal.open();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer"
                                 >
                                    <Trash2 size={13} /> Xoá thương hiệu
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                  </>
               )}
            </div>
         </div>

         {saveError && (
            <div className="mx-6 mt-4 border border-promotion/30 bg-promotion-light text-promotion text-[13px] px-4 py-2.5 rounded-lg">
               {saveError}
            </div>
         )}

         {/* ── Save error ── */}
         {saveError && (
            <div className="mx-6 mt-4 border border-promotion/30 bg-promotion-light text-promotion text-[13px] px-4 py-2.5 rounded-lg">
               {saveError}
            </div>
         )}

         {/* ── Main content ── */}
         <div className="px-6 py-6 flex gap-5 items-start max-w-5xl">
            {/* ── Left column ── */}
            <div className="w-60 shrink-0 space-y-4">
               {/* Logo card */}
               <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
                  <div className="w-full h-48 bg-neutral-light-hover relative">
                     <BrandImage brand={brand} previewUrl={editPreviewUrl} />
                  </div>

                  {/* Image controls khi edit */}
                  {isEditing && (
                     <div className="px-4 py-3 border-t border-neutral space-y-2">
                        <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                           <Upload size={13} />
                           {editImageFile ? editImageFile.name : "Tải ảnh mới"}
                           <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                           />
                        </label>
                        {(brand.imageUrl || brand.imagePath) &&
                           !editRemoveImage && (
                              <button
                                 onClick={() => {
                                    setEditRemoveImage(true);
                                    setEditImageFile(null);
                                    if (editPreviewUrl)
                                       URL.revokeObjectURL(editPreviewUrl);
                                    setEditPreviewUrl(null);
                                 }}
                                 className="w-full text-[12px] text-promotion hover:bg-promotion-light px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                              >
                                 Xoá ảnh hiện tại
                              </button>
                           )}
                        {editRemoveImage && (
                           <p className="text-[11px] text-promotion text-center">
                              Ảnh sẽ bị xoá khi lưu
                           </p>
                        )}
                     </div>
                  )}

                  <div className="px-4 py-3 border-t border-neutral space-y-2.5">
                     <div>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                           Slug
                        </p>
                        <p className="text-[12px] text-primary font-mono bg-neutral-light-active px-2.5 py-1.5 rounded-lg">
                           /{brand.slug}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Status card */}
               <div className="bg-neutral-light border border-neutral rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                     Trạng thái
                  </p>

                  {isEditing ? (
                     <div className="space-y-3">
                        {/* Toggle isActive */}
                        <div className="flex items-center justify-between">
                           <span className="text-[13px] text-primary">
                              Hiển thị
                           </span>
                           <button
                              onClick={() => setEditIsActive((v) => !v)}
                              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${editIsActive ? "bg-accent" : "bg-neutral"}`}
                           >
                              <span
                                 className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editIsActive ? "left-5" : "left-0.5"}`}
                              />
                           </button>
                        </div>
                        {/* Toggle isFeatured */}
                        <div className="flex items-center justify-between">
                           <span className="text-[13px] text-primary">
                              Nổi bật
                           </span>
                           <button
                              onClick={() => setEditIsFeatured((v) => !v)}
                              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${editIsFeatured ? "bg-amber-400" : "bg-neutral"}`}
                           >
                              <span
                                 className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${editIsFeatured ? "left-5" : "left-0.5"}`}
                              />
                           </button>
                        </div>
                     </div>
                  ) : (
                     <>
                        <div className="flex items-center justify-between">
                           <span className="text-[13px] text-primary">
                              Hiển thị
                           </span>
                           <span
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${brand.isActive ? "text-emerald-600 bg-emerald-50" : "text-orange-500 bg-orange-50"}`}
                           >
                              {brand.isActive ? (
                                 <CheckCircle2 size={11} />
                              ) : (
                                 <EyeOff size={11} />
                              )}
                              {brand.isActive ? "Hoạt động" : "Ẩn"}
                           </span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[13px] text-primary">
                              Nổi bật
                           </span>
                           <span
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${brand.isFeatured ? "text-amber-600 bg-amber-50" : "text-primary bg-neutral-light-active"}`}
                           >
                              <Star
                                 size={11}
                                 fill={
                                    brand.isFeatured ? "currentColor" : "none"
                                 }
                              />
                              {brand.isFeatured ? "Nổi bật" : "Thường"}
                           </span>
                        </div>
                     </>
                  )}
               </div>
            </div>

            {/* ── Right column ── */}
            <div className="flex-1 min-w-0 space-y-4">
               {/* Hero info */}
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
                  {isEditing ? (
                     <div className="space-y-4">
                        <EditField label="Tên thương hiệu">
                           <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={inputCls}
                              placeholder="Nhập tên thương hiệu"
                           />
                        </EditField>
                        <EditField label="Mô tả">
                           <textarea
                              value={editDescription}
                              onChange={(e) =>
                                 setEditDescription(e.target.value)
                              }
                              rows={4}
                              className={`${inputCls} resize-none`}
                              placeholder="Nhập mô tả thương hiệu"
                           />
                        </EditField>
                     </div>
                  ) : (
                     <>
                        <h1 className="text-[22px] font-bold text-primary leading-tight">
                           {brand.name}
                        </h1>
                        <p className="text-[11px] text-primary font-mono mt-1 mb-4">
                           {brand.id}
                        </p>
                        <div className="border-t border-neutral pt-4">
                           <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">
                              Mô tả
                           </p>
                           <p className="text-[14px] text-primary leading-relaxed">
                              {brand.description ?? (
                                 <span className="text-primary italic text-[13px]">
                                    Chưa có mô tả
                                 </span>
                              )}
                           </p>
                        </div>
                     </>
                  )}
               </div>

               {/* Stats grid */}
               <div className="grid grid-cols-3 gap-3">
                  <StatCard
                     icon={<Package size={16} />}
                     label="Sản phẩm"
                     value={brand._count?.products}
                     sub="sản phẩm liên kết"
                     accent="bg-blue-50 text-blue-500"
                  />
                  <StatCard
                     icon={<Calendar size={15} />}
                     label="Ngày tạo"
                     value={createdDate}
                     accent="bg-violet-50 text-violet-500"
                  />
                  <StatCard
                     icon={<RefreshCw size={14} />}
                     label="Cập nhật"
                     value={updatedDate}
                     sub={updatedTime}
                     accent="bg-emerald-50 text-emerald-500"
                  />
               </div>

               {/* Image info */}
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                     Thông tin ảnh
                  </p>
                  <div className="space-y-2.5">
                     <div>
                        <p className="text-[11px] text-primary mb-1">
                           Image Path
                        </p>
                        <p className="text-[12px] font-mono bg-neutral-light-active px-3 py-2 rounded-xl text-primary truncate border border-neutral">
                           {brand.imagePath ?? (
                              <span className="not-italic font-sans text-primary">
                                 —
                              </span>
                           )}
                        </p>
                     </div>
                     <div>
                        <p className="text-[11px] text-primary mb-1">CDN URL</p>
                        <p className="text-[12px] font-mono bg-neutral-light-active px-3 py-2 rounded-xl text-primary truncate border border-neutral">
                           {brand.imageUrl ?? (
                              <span className="not-italic font-sans text-primary/60 text-[11px]">
                                 Chưa upload lên CDN
                              </span>
                           )}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
