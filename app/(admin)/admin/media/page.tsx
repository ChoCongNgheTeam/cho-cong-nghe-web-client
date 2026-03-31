"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import {
   getAllMedia,
   createMedia,
   updateMedia,
   deleteMedia,
   reorderMedia,
   toggleMediaActive,
} from "./_libs/media.api";
import {
   Media,
   MediaType,
   MediaPosition,
   MEDIA_TYPES,
   MEDIA_POSITIONS,
   positionLabel,
} from "./media.types";
import { usePopzy } from "@/components/Modal/usePopzy";
import { useToasty } from "@/components/Toast";
import { Popzy } from "@/components/Modal";

// ─── Constants ────────────────────────────────────────────────────────────────
const typeColor: Record<MediaType, string> = {
   SLIDER: "bg-accent-light text-accent border border-accent/30",
   BANNER: "bg-promotion-light text-promotion border border-promotion/30",
};

// ─── Form State ───────────────────────────────────────────────────────────────
interface FormState {
   type: MediaType;
   position: MediaPosition;
   title: string;
   subTitle: string;
   linkUrl: string;
   order: string;
   isActive: boolean;
   imageFile: File | null;
   imagePreview: string | null;
}

const defaultForm: FormState = {
   type: "SLIDER",
   position: "HOME_TOP",
   title: "",
   subTitle: "",
   linkUrl: "",
   order: "",
   isActive: true,
   imageFile: null,
   imagePreview: null,
};

// ─── Media Form Component ─────────────────────────────────────────────────────
function MediaForm({
   initial,
   onSubmit,
   loading,
}: {
   initial?: Partial<FormState & { imageUrl?: string }>;
   onSubmit: (fd: FormData) => Promise<void>;
   loading: boolean;
}) {
   const [form, setForm] = useState<FormState>(() => ({
      ...defaultForm,
      ...initial,
      imagePreview: initial?.imageUrl ?? null,
   }));
   const fileRef = useRef<HTMLInputElement>(null);

   const set = (key: keyof FormState, value: unknown) =>
      setForm((prev) => ({ ...prev, [key]: value }));

   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      set("imageFile", file);
      if (file) {
         const reader = new FileReader();
         reader.onload = (ev) =>
            set("imagePreview", ev.target?.result as string);
         reader.readAsDataURL(file);
      } else {
         set("imagePreview", null);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const fd = new FormData();
      fd.append("type", form.type);
      fd.append("position", form.position);
      if (form.title) fd.append("title", form.title);
      if (form.subTitle) fd.append("subTitle", form.subTitle);
      if (form.linkUrl) fd.append("linkUrl", form.linkUrl);
      if (form.order !== "") fd.append("order", form.order);
      fd.append("isActive", String(form.isActive));
      if (form.imageFile) fd.append("imageUrl", form.imageFile);
      await onSubmit(fd);
   };

   const inputCls =
      "w-full rounded-lg border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder-neutral-dark outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
   const selectCls = inputCls + " cursor-pointer";
   const labelCls =
      "mb-1.5 block text-xs font-semibold text-primary uppercase tracking-widest";

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         {/* Type & Position */}
         <div className="grid grid-cols-2 gap-3">
            <div>
               <label className={labelCls}>Type</label>
               <select
                  className={selectCls}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as MediaType)}
               >
                  {MEDIA_TYPES.map((t) => (
                     <option key={t} value={t}>
                        {t}
                     </option>
                  ))}
               </select>
            </div>
            <div>
               <label className={labelCls}>Position</label>
               <select
                  className={selectCls}
                  value={form.position}
                  onChange={(e) =>
                     set("position", e.target.value as MediaPosition)
                  }
               >
                  {MEDIA_POSITIONS.map((p) => (
                     <option key={p} value={p}>
                        {positionLabel[p]}
                     </option>
                  ))}
               </select>
            </div>
         </div>

         {/* Title */}
         <div>
            <label className={labelCls}>Title</label>
            <input
               className={inputCls}
               placeholder="Nhập tiêu đề..."
               value={form.title}
               onChange={(e) => set("title", e.target.value)}
            />
         </div>

         {/* Sub Title */}
         <div>
            <label className={labelCls}>Sub Title</label>
            <input
               className={inputCls}
               placeholder="Nhập mô tả ngắn..."
               value={form.subTitle}
               onChange={(e) => set("subTitle", e.target.value)}
            />
         </div>

         {/* Link URL */}
         <div>
            <label className={labelCls}>Link URL</label>
            <input
               className={inputCls}
               placeholder="https://..."
               value={form.linkUrl}
               onChange={(e) => set("linkUrl", e.target.value)}
            />
         </div>

         {/* Order & Status */}
         <div className="grid grid-cols-2 gap-3">
            <div>
               <label className={labelCls}>Order</label>
               <input
                  className={inputCls}
                  type="number"
                  min={0}
                  placeholder="Tự động"
                  value={form.order}
                  onChange={(e) => set("order", e.target.value)}
               />
            </div>
            <div>
               <label className={labelCls}>Trạng thái</label>
               <button
                  type="button"
                  onClick={() => set("isActive", !form.isActive)}
                  className={`flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border text-sm font-medium transition ${
                     form.isActive
                        ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-400"
                        : "border-neutral bg-neutral-light text-neutral-dark"
                  }`}
               >
                  <span
                     className={`h-2 w-2 rounded-full ${
                        form.isActive ? "bg-green-500" : "bg-neutral-dark"
                     }`}
                  />
                  {form.isActive ? "Đang hiện" : "Đã ẩn"}
               </button>
            </div>
         </div>

         {/* Image Upload */}
         <div>
            <label className={labelCls}>Hình ảnh</label>
            <div
               className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-neutral bg-neutral-light transition hover:border-accent hover:bg-accent-light"
               style={{ minHeight: 120 }}
               onClick={() => fileRef.current?.click()}
            >
               {form.imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={form.imagePreview}
                     alt="preview"
                     className="h-36 w-full object-cover"
                  />
               ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-neutral-dark">
                     <svg
                        width="28"
                        height="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.332-8.82 3.997 3.997 0 0 1 6.614-3.654A4.5 4.5 0 0 1 17.25 19.5H6.75Z"
                        />
                     </svg>
                     <span className="text-xs font-medium">
                        Click để tải ảnh lên
                     </span>
                  </div>
               )}
               <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
               />
            </div>
            {form.imagePreview && (
               <button
                  type="button"
                  onClick={(e) => {
                     e.stopPropagation();
                     set("imageFile", null);
                     set("imagePreview", null);
                     if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="mt-1.5 text-xs text-neutral-dark hover:text-promotion transition"
               >
                  ✕ Xoá ảnh
               </button>
            )}
         </div>

         <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover active:bg-accent-active disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {loading ? (
               <span className="flex items-center justify-center gap-2">
                  <svg
                     className="h-4 w-4 animate-spin"
                     fill="none"
                     viewBox="0 0 24 24"
                  >
                     <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                     />
                     <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                     />
                  </svg>
                  Đang lưu...
               </span>
            ) : (
               "Lưu thay đổi"
            )}
         </button>
      </form>
   );
}

// ─── Delete Confirm Content ───────────────────────────────────────────────────
function DeleteConfirmContent({
   item,
   onConfirm,
   onCancel,
}: {
   item: Media;
   onConfirm: () => void;
   onCancel: () => void;
}) {
   return (
      <div className="space-y-4">
         <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-promotion-light text-promotion">
               <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
               </svg>
            </div>
            <div>
               <p className="font-semibold text-primary">Xác nhận xoá</p>
               <p className="mt-0.5 text-sm text-primary">
                  Bạn có chắc muốn xoá{" "}
                  <span className="font-medium text-primary">
                     &ldquo;{item.title ?? "media này"}&rdquo;
                  </span>
                  ? Hành động này không thể hoàn tác.
               </p>
            </div>
         </div>

         {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
               src={item.imageUrl}
               alt=""
               className="h-28 w-full rounded-lg object-cover opacity-80"
            />
         )}

         <div className="flex gap-3 pt-1">
            <button
               onClick={onCancel}
               className="flex-1 rounded-lg border border-neutral py-2.5 text-sm font-medium text-primary transition hover:bg-neutral-light-active"
            >
               Huỷ
            </button>
            <button
               onClick={onConfirm}
               className="flex-1 rounded-lg bg-promotion py-2.5 text-sm font-semibold text-white transition hover:bg-promotion-hover active:bg-promotion-active"
            >
               Xoá
            </button>
         </div>
      </div>
   );
}

// ─── Reorder Content ──────────────────────────────────────────────────────────
function ReorderContent({
   item,
   onConfirm,
   onCancel,
}: {
   item: Media;
   onConfirm: (order: number) => void;
   onCancel: () => void;
}) {
   const [val, setVal] = useState(String(item.order));

   return (
      <div className="space-y-4">
         <p className="text-sm text-primary">
            Đặt vị trí mới cho{" "}
            <span className="font-semibold text-primary">
               &ldquo;{item.title ?? "media này"}&rdquo;
            </span>{" "}
            trong{" "}
            <span className="font-medium text-accent">
               {positionLabel[item.position]}
            </span>
            .
         </p>
         <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-primary">
               Thứ tự mới
            </label>
            <input
               type="number"
               min={0}
               value={val}
               onChange={(e) => setVal(e.target.value)}
               className="w-full rounded-lg border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
               placeholder="0"
               autoFocus
            />
         </div>
         <div className="flex gap-3">
            <button
               onClick={onCancel}
               className="flex-1 rounded-lg border border-neutral py-2.5 text-sm font-medium text-primary transition hover:bg-neutral-light-active"
            >
               Huỷ
            </button>
            <button
               onClick={() => onConfirm(parseInt(val, 10))}
               disabled={val === ""}
               className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-40"
            >
               Xác nhận
            </button>
         </div>
      </div>
   );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MediaAdminPage() {
   const { success, error: toastError } = useToasty();

   // Data
   const [mediaList, setMediaList] = useState<Media[]>([]);
   const [loading, setLoading] = useState(true);
   const [formLoading, setFormLoading] = useState(false);

   // Modal targets
   const [editTarget, setEditTarget] = useState<Media | null>(null);
   const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
   const [reorderTarget, setReorderTarget] = useState<Media | null>(null);

   // Modals
   const createModal = usePopzy();
   const editModal = usePopzy();
   const deleteModal = usePopzy();
   const reorderModal = usePopzy();

   // Filters
   const [filterType, setFilterType] = useState<MediaType | "ALL">("ALL");
   const [filterPosition, setFilterPosition] = useState<MediaPosition | "ALL">(
      "ALL",
   );
   const [searchQuery, setSearchQuery] = useState("");

   // ── Fetch ──
   const fetchAll = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getAllMedia();
         setMediaList(data);
      } catch {
         toastError("Không tải được danh sách media");
      } finally {
         setLoading(false);
      }
   }, [toastError]);

   useEffect(() => {
      fetchAll();
   }, [fetchAll]);

   // ── Filtered ──
   const filtered = mediaList.filter((m) => {
      if (filterType !== "ALL" && m.type !== filterType) return false;
      if (filterPosition !== "ALL" && m.position !== filterPosition)
         return false;
      if (
         searchQuery &&
         !m.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
         return false;
      return true;
   });

   // ── Create ──
   const handleCreate = async (fd: FormData) => {
      setFormLoading(true);
      try {
         await createMedia(fd);
         success("Tạo media thành công");
         createModal.close();
         fetchAll();
      } catch (e: unknown) {
         toastError((e as Error)?.message ?? "Tạo thất bại");
      } finally {
         setFormLoading(false);
      }
   };

   // ── Update ──
   const handleUpdate = async (fd: FormData) => {
      if (!editTarget) return;
      setFormLoading(true);
      try {
         await updateMedia(editTarget.id, fd);
         success("Cập nhật thành công");
         editModal.close();
         setEditTarget(null);
         fetchAll();
      } catch (e: unknown) {
         toastError((e as Error)?.message ?? "Cập nhật thất bại");
      } finally {
         setFormLoading(false);
      }
   };

   // ── Delete ──
   const handleDelete = async () => {
      if (!deleteTarget) return;
      try {
         await deleteMedia(deleteTarget.id);
         success("Đã xoá media");
         deleteModal.close();
         setDeleteTarget(null);
         fetchAll();
      } catch (e: unknown) {
         toastError((e as Error)?.message ?? "Xoá thất bại");
      }
   };

   // ── Reorder ──
   const handleReorder = async (newOrder: number) => {
      if (!reorderTarget) return;
      try {
         await reorderMedia(reorderTarget.id, newOrder);
         success("Sắp xếp thành công");
         reorderModal.close();
         setReorderTarget(null);
         fetchAll();
      } catch (e: unknown) {
         toastError((e as Error)?.message ?? "Sắp xếp thất bại");
      }
   };

   // ── Toggle Active ──
   const handleToggleActive = async (item: Media) => {
      try {
         await toggleMediaActive(item.id, !item.isActive);
         success(item.isActive ? "Đã ẩn media" : "Đã hiện media");
         fetchAll();
      } catch (e: unknown) {
         toastError((e as Error)?.message ?? "Thao tác thất bại");
      }
   };

   // ── Open edit modal ──
   const openEdit = (item: Media) => {
      setEditTarget(item);
      editModal.open();
   };

   // ── Open delete modal ──
   const openDelete = (item: Media) => {
      setDeleteTarget(item);
      deleteModal.open();
   };

   // ── Open reorder modal ──
   const openReorder = (item: Media) => {
      setReorderTarget(item);
      reorderModal.open();
   };

   return (
      <div className="min-h-screen bg-neutral-light">
         <div className="px-6 py-10">
            {/* ── Header ── */}
            <div className="mb-8 flex items-start justify-between">
               <div>
                  <h1 className="text-2xl font-bold text-primary">
                     Quản lý Media
                  </h1>
                  <p className="mt-1 text-sm text-primary">
                     {mediaList.length} mục ·{" "}
                     {mediaList.filter((m) => m.isActive).length} đang hiện
                  </p>
               </div>
               <button
                  onClick={createModal.open}
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover active:bg-accent-active"
               >
                  <svg
                     width="16"
                     height="16"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth={2.2}
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                     />
                  </svg>
                  Thêm Media
               </button>
            </div>

            {/* ── Filters ── */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
               {/* Search */}
               <div className="relative">
                  <svg
                     className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark"
                     width="15"
                     height="15"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth={2}
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                     />
                  </svg>
                  <input
                     className="rounded-lg border border-neutral bg-neutral-light-hover pl-9 pr-4 py-2 text-sm text-primary placeholder-neutral-dark outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                     style={{ minWidth: 200 }}
                     placeholder="Tìm theo tiêu đề..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               {/* Type filter */}
               <select
                  className="rounded-lg border border-neutral bg-neutral-light px-3.5 py-2 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  value={filterType}
                  onChange={(e) =>
                     setFilterType(e.target.value as MediaType | "ALL")
                  }
               >
                  <option value="ALL">Tất cả Type</option>
                  {MEDIA_TYPES.map((t) => (
                     <option key={t} value={t}>
                        {t}
                     </option>
                  ))}
               </select>

               {/* Position filter */}
               <select
                  className="rounded-lg border border-neutral bg-neutral-light px-3.5 py-2 text-sm text-primary outline-none focus:border-accent cursor-pointer"
                  value={filterPosition}
                  onChange={(e) =>
                     setFilterPosition(e.target.value as MediaPosition | "ALL")
                  }
               >
                  <option value="ALL">Tất cả Position</option>
                  {MEDIA_POSITIONS.map((p) => (
                     <option key={p} value={p}>
                        {positionLabel[p]}
                     </option>
                  ))}
               </select>

               {/* Clear */}
               {(filterType !== "ALL" ||
                  filterPosition !== "ALL" ||
                  searchQuery) && (
                  <button
                     className="rounded-lg border border-neutral px-3.5 py-2 text-xs text-primary transition hover:text-primary hover:bg-neutral-light-active"
                     onClick={() => {
                        setFilterType("ALL");
                        setFilterPosition("ALL");
                        setSearchQuery("");
                     }}
                  >
                     ✕ Xoá bộ lọc
                  </button>
               )}
            </div>

            {/* ── Table ── */}
            <div className="overflow-hidden rounded-xl border border-neutral bg-neutral-light shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="border-b border-neutral bg-neutral-light-active">
                           {[
                              "Hình ảnh",
                              "Tiêu đề / Mô tả",
                              "Type",
                              "Position",
                              "Thứ tự",
                              "Trạng thái",
                              "Đã xoá",
                              "Thao tác",
                           ].map((h) => (
                              <th
                                 key={h}
                                 className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-primary"
                              >
                                 {h}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-neutral">
                        {loading ? (
                           <tr>
                              <td
                                 colSpan={8}
                                 className="py-20 text-center text-neutral-dark"
                              >
                                 <div className="flex items-center justify-center gap-2">
                                    <svg
                                       className="h-5 w-5 animate-spin text-accent"
                                       fill="none"
                                       viewBox="0 0 24 24"
                                    >
                                       <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                       />
                                       <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                                       />
                                    </svg>
                                    Đang tải...
                                 </div>
                              </td>
                           </tr>
                        ) : filtered.length === 0 ? (
                           <tr>
                              <td
                                 colSpan={8}
                                 className="py-20 text-center text-neutral-dark"
                              >
                                 Không tìm thấy media nào
                              </td>
                           </tr>
                        ) : (
                           filtered.map((item) => (
                              <tr
                                 key={item.id}
                                 className="transition hover:bg-neutral-light-hover"
                              >
                                 {/* Image */}
                                 <td className="px-5 py-3.5">
                                    {item.imageUrl ? (
                                       // eslint-disable-next-line @next/next/no-img-element
                                       <img
                                          src={item.imageUrl}
                                          alt={item.title ?? ""}
                                          className="h-12 w-20 rounded-lg object-cover border border-neutral"
                                       />
                                    ) : (
                                       <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-neutral bg-neutral-light-active text-neutral-dark">
                                          <svg
                                             width="18"
                                             height="18"
                                             fill="none"
                                             stroke="currentColor"
                                             strokeWidth={1.5}
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                             />
                                          </svg>
                                       </div>
                                    )}
                                 </td>

                                 {/* Title / Sub / Link */}
                                 <td className="px-5 py-3.5">
                                    <p className="font-medium text-primary">
                                       {item.title ?? (
                                          <span className="italic text-neutral-dark">
                                             —
                                          </span>
                                       )}
                                    </p>
                                    {item.subTitle && (
                                       <p className="mt-0.5 text-xs text-primary line-clamp-1">
                                          {item.subTitle}
                                       </p>
                                    )}
                                    {item.linkUrl && (
                                       <p className="mt-0.5 max-w-[200px] truncate text-xs text-neutral-dark">
                                          {item.linkUrl}
                                       </p>
                                    )}
                                 </td>

                                 {/* Type */}
                                 <td className="px-5 py-3.5">
                                    <span
                                       className={`rounded-md px-2.5 py-1 text-xs font-semibold ${typeColor[item.type]}`}
                                    >
                                       {item.type}
                                    </span>
                                 </td>

                                 {/* Position */}
                                 <td className="px-5 py-3.5 text-xs text-primary">
                                    {positionLabel[item.position]}
                                 </td>

                                 {/* Order */}
                                 <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                       <span className="font-mono text-sm text-primary">
                                          {item.order}
                                       </span>
                                       <button
                                          onClick={() => openReorder(item)}
                                          title="Đổi thứ tự"
                                          className="rounded px-1.5 py-0.5 text-xs text-neutral-dark transition hover:bg-neutral hover:text-primary"
                                       >
                                          ↕
                                       </button>
                                    </div>
                                 </td>

                                 {/* Status toggle */}
                                 <td className="px-5 py-3.5">
                                    <button
                                       onClick={() => handleToggleActive(item)}
                                       title={
                                          item.isActive
                                             ? "Click để ẩn"
                                             : "Click để hiện"
                                       }
                                       className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                          item.isActive
                                             ? "bg-green-500"
                                             : "bg-neutral"
                                       }`}
                                    >
                                       <span
                                          className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                             item.isActive
                                                ? "translate-x-4"
                                                : "translate-x-0.5"
                                          }`}
                                       />
                                    </button>
                                 </td>

                                 {/* Deleted */}
                                 <td className="px-5 py-3.5">
                                    {item.deletedAt ? (
                                       <div>
                                          <span className="inline-flex items-center gap-1 rounded-md bg-promotion-light px-2 py-0.5 text-xs font-semibold text-promotion">
                                             <span className="h-1.5 w-1.5 rounded-full bg-promotion" />
                                             Đã xoá
                                          </span>
                                          <p className="mt-1 text-[11px] text-neutral-dark">
                                             {new Date(
                                                item.deletedAt,
                                             ).toLocaleDateString("vi-VN")}
                                          </p>
                                          {item.deletedBy && (
                                             <p className="text-[11px] text-neutral-dark truncate max-w-[120px]">
                                                bởi {item.deletedBy}
                                             </p>
                                          )}
                                       </div>
                                    ) : (
                                       <span className="text-xs text-neutral-dark italic">
                                          —
                                       </span>
                                    )}
                                 </td>

                                 {/* Actions */}
                                 <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1">
                                       <button
                                          onClick={() => openEdit(item)}
                                          title="Chỉnh sửa"
                                          className="rounded-lg p-1.5 text-primary transition hover:bg-accent-light hover:text-accent"
                                       >
                                          <svg
                                             width="15"
                                             height="15"
                                             fill="none"
                                             stroke="currentColor"
                                             strokeWidth={1.8}
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                                             />
                                          </svg>
                                       </button>
                                       <button
                                          onClick={() => openDelete(item)}
                                          title="Xoá"
                                          className="rounded-lg p-1.5 text-primary transition hover:bg-promotion-light hover:text-promotion"
                                       >
                                          <svg
                                             width="15"
                                             height="15"
                                             fill="none"
                                             stroke="currentColor"
                                             strokeWidth={1.8}
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                             />
                                          </svg>
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* ── Stats bar ── */}
            {!loading && (
               <div className="mt-3 flex flex-wrap gap-4 text-xs text-primary">
                  <span>
                     Hiển thị{" "}
                     <span className="font-medium text-primary">
                        {filtered.length}
                     </span>{" "}
                     /{" "}
                     <span className="font-medium text-primary">
                        {mediaList.length}
                     </span>{" "}
                     mục
                  </span>
                  {MEDIA_POSITIONS.map((p) => {
                     const count = mediaList.filter(
                        (m) => m.position === p,
                     ).length;
                     return count > 0 ? (
                        <span key={p}>
                           {positionLabel[p]}:{" "}
                           <span className="font-medium text-primary">
                              {count}
                           </span>
                        </span>
                     ) : null;
                  })}
               </div>
            )}
         </div>

         {/* ── Modal: Create ── */}
         <Popzy
            isOpen={createModal.isOpen}
            onClose={createModal.close}
            content={
               <div>
                  <h2 className="mb-5 text-base font-semibold text-primary">
                     Tạo Media mới
                  </h2>
                  <MediaForm onSubmit={handleCreate} loading={formLoading} />
               </div>
            }
            closeMethods={["button", "overlay", "escape"]}
         />

         {/* ── Modal: Edit ── */}
         <Popzy
            isOpen={editModal.isOpen}
            onClose={() => {
               editModal.close();
               setEditTarget(null);
            }}
            content={
               editTarget ? (
                  <div>
                     <h2 className="mb-5 text-base font-semibold text-primary">
                        Chỉnh sửa Media
                     </h2>
                     <MediaForm
                        initial={{
                           type: editTarget.type,
                           position: editTarget.position,
                           title: editTarget.title ?? "",
                           subTitle: editTarget.subTitle ?? "",
                           linkUrl: editTarget.linkUrl ?? "",
                           order: String(editTarget.order),
                           isActive: editTarget.isActive,
                           imageUrl: editTarget.imageUrl ?? undefined,
                        }}
                        onSubmit={handleUpdate}
                        loading={formLoading}
                     />
                  </div>
               ) : null
            }
            closeMethods={["button", "overlay", "escape"]}
         />

         {/* ── Modal: Delete ── */}
         <Popzy
            isOpen={deleteModal.isOpen}
            onClose={() => {
               deleteModal.close();
               setDeleteTarget(null);
            }}
            content={
               deleteTarget ? (
                  <DeleteConfirmContent
                     item={deleteTarget}
                     onConfirm={handleDelete}
                     onCancel={() => {
                        deleteModal.close();
                        setDeleteTarget(null);
                     }}
                  />
               ) : null
            }
            closeMethods={["button", "overlay", "escape"]}
         />

         <Popzy
            isOpen={reorderModal.isOpen}
            onClose={() => {
               reorderModal.close();
               setReorderTarget(null);
            }}
            content={
               reorderTarget ? (
                  <div>
                     <h2 className="mb-4 text-base font-semibold text-primary">
                        Sắp xếp thứ tự
                     </h2>
                     <ReorderContent
                        item={reorderTarget}
                        onConfirm={(order) => handleReorder(order)}
                        onCancel={() => {
                           reorderModal.close();
                           setReorderTarget(null);
                        }}
                     />
                  </div>
               ) : null
            }
            closeMethods={["button", "overlay", "escape"]}
         />
      </div>
   );
}
