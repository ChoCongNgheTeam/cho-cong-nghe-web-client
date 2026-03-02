"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { Brand } from "../brand.types";
import { getBrand } from "../_libs";

function BrandImage({ brand }: { brand: Brand }) {
   const [imgError, setImgError] = useState(false);
   const src = brand.imageUrl ?? brand.imagePath ?? null;

   if (src && !imgError) {
      return (
         <div className="relative w-full h-full">
            <Image
               src={src}
               alt={brand.name}
               fill
               className="object-contain p-3"
               onError={() => setImgError(true)}
               unoptimized={!brand.imageUrl}
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

export default function AdminBrand() {
   const { id } = useParams<{ id: string }>();
   const router = useRouter();

   const [brand, setBrand] = useState<Brand | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [menuOpen, setMenuOpen] = useState(false);

   useEffect(() => {
      if (!id) return;
      setLoading(true);
      setError(null);
      getBrand(id)
         .then((res) => setBrand(res.data))
         .catch((err) => setError(err?.message || "Không thể tải thương hiệu"))
         .finally(() => setLoading(false));
   }, [id]);

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
               className="text-[13px] text-primary hover:text-primary transition-colors cursor-pointer"
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
         {/* ── Sticky top bar ── */}
         <div className="sticky top-0 z-10 bg-neutral-light/80 backdrop-blur-sm border-b border-neutral px-6 py-3 flex items-center justify-between">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-1.5 text-[13px] text-primary hover:text-primary transition-colors cursor-pointer"
            >
               <ArrowLeft size={14} />
               Thương hiệu
            </button>

            <div className="flex items-center gap-2">
               <button className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-sm">
                  <Pencil size={13} strokeWidth={2.5} />
                  Chỉnh sửa
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
                              <ExternalLink size={13} />
                              Xem ngoài shop
                           </button>
                           <div className="h-px bg-neutral mx-2" />
                           <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer">
                              <Trash2 size={13} />
                              Xoá thương hiệu
                           </button>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>

         {/* ── Main content ── */}
         <div className="px-6 py-6 flex gap-5 items-start max-w-5xl">
            {/* ── Left column ── */}
            <div className="w-60 shrink-0 space-y-4">
               {/* Logo card */}
               <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
                  <div className="w-full h-48 bg-neutral-light-hover relative">
                     <BrandImage brand={brand} />
                  </div>
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

                  <div className="flex items-center justify-between">
                     <span className="text-[13px] text-primary">Hiển thị</span>
                     <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${
                           brand.isActive
                              ? "text-emerald-600 bg-emerald-50"
                              : "text-orange-500 bg-orange-50"
                        }`}
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
                     <span className="text-[13px] text-primary">Nổi bật</span>
                     <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium ${
                           brand.isFeatured
                              ? "text-amber-600 bg-amber-50"
                              : "text-primary bg-neutral-light-active"
                        }`}
                     >
                        <Star
                           size={11}
                           fill={brand.isFeatured ? "currentColor" : "none"}
                        />
                        {brand.isFeatured ? "Nổi bật" : "Thường"}
                     </span>
                  </div>
               </div>
            </div>

            {/* ── Right column ── */}
            <div className="flex-1 min-w-0 space-y-4">
               {/* Hero info */}
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
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
               </div>

               {/* Stats grid */}
               <div className="grid grid-cols-3 gap-3">
                  <StatCard
                     icon={<Package size={16} />}
                     label="Sản phẩm"
                     value={brand._count.products}
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
