// ── CategoryImageEditor ────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import {
   Upload,
   Trash2 as TrashIcon,
   ImageIcon,
   Loader2,
   Tag,
} from "lucide-react";
import { updateCampaignCategory } from "../_libs/campaigns";
import { CampaignCategory } from "../campaign.types";

export function CategoryImageEditor({
   cc,
   campaignId,
   onUpdated,
}: {
   cc: CampaignCategory;
   campaignId: string;
   onUpdated: (updated: { id: string; imageUrl: string | undefined }) => void;
}) {
   const inputRef = useRef<HTMLInputElement>(null);
   const [uploading, setUploading] = useState(false);
   const [hover, setHover] = useState(false);
   const categoryId = (cc as any).categoryId ?? (cc as any).category?.id;
   const handleFile = async (file: File) => {
      setUploading(true);
      try {
         const res = await updateCampaignCategory(campaignId, categoryId, {
            image: file,
         });
         // Dùng URL thực từ server trả về, không dùng blob URL
         const updatedImageUrl =
            (res.data as any)?.imageUrl ?? URL.createObjectURL(file);
         onUpdated({ id: cc.id, imageUrl: updatedImageUrl });
      } catch (e: any) {
         alert(e?.message ?? "Không thể cập nhật ảnh");
      } finally {
         setUploading(false);
      }
   };

   const handleRemove = async () => {
      setUploading(true);
      try {
         await updateCampaignCategory(campaignId, categoryId, {
            removeImage: true,
         });
         onUpdated({ id: cc.id, imageUrl: undefined });
      } catch (e: any) {
         alert(e?.message ?? "Không thể xoá ảnh");
      } finally {
         setUploading(false);
      }
   };

   return (
      <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-light-active transition-colors group">
         {/* Ảnh — click để đổi */}
         <div
            className="relative w-8 h-8 rounded-lg shrink-0 cursor-pointer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => !uploading && inputRef.current?.click()}
         >
            {uploading ? (
               <div className="w-8 h-8 rounded-lg bg-neutral-light-active flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin text-accent" />
               </div>
            ) : cc.imageUrl ? (
               <>
                  <img
                     src={cc.imageUrl}
                     alt={cc.category.name}
                     className="w-8 h-8 rounded-lg object-cover"
                  />
                  {hover && (
                     <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
                        <Upload size={10} className="text-white" />
                     </div>
                  )}
               </>
            ) : (
               <div className="w-8 h-8 rounded-lg bg-neutral-light-active flex items-center justify-center">
                  {hover ? (
                     <Upload size={10} className="text-accent" />
                  ) : (
                     <Tag size={12} className="text-neutral-dark" />
                  )}
               </div>
            )}
            <input
               ref={inputRef}
               type="file"
               accept="image/*"
               className="hidden"
               onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
               }}
            />
         </div>

         {/* Info */}
         <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-primary truncate">
               {cc.title || cc.category.name}
            </p>
            <p className="text-[10px] text-neutral-dark">
               Vị trí #{cc.position}
            </p>
         </div>

         {/* Nút xoá ảnh — chỉ hiện khi có ảnh */}
         {cc.imageUrl && !uploading && (
            <button
               onClick={handleRemove}
               className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-promotion-light hover:text-promotion text-neutral-dark transition-all cursor-pointer"
               title="Xoá ảnh"
            >
               <TrashIcon size={11} />
            </button>
         )}
      </div>
   );
}
