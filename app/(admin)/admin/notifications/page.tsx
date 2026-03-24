"use client";

import { useState } from "react";
import { sendCampaign } from "./libs/notification.api";
import {
   Bell,
   Send,
   Loader2,
   Users,
   Target,
   AlertCircle,
   CheckCircle2,
   Megaphone,
} from "lucide-react";

export default function NotificationAdmin() {
   const [title, setTitle] = useState("");
   const [body, setBody] = useState("");
   const [targetAll, setTargetAll] = useState(true);
   const [userIdsRaw, setUserIdsRaw] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   const handleSubmit = async () => {
      if (!title.trim() || !body.trim()) {
         setError("Tiêu đề và nội dung không được để trống.");
         return;
      }

      const userIds = targetAll
         ? []
         : userIdsRaw
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean);

      if (!targetAll && userIds.length === 0) {
         setError("Vui lòng nhập ít nhất 1 user ID hoặc chọn gửi tất cả.");
         return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const res = await sendCampaign({ title, body, targetAll, userIds });
         setSuccess(res.message);
         setTitle("");
         setBody("");
         setUserIdsRaw("");
      } catch (e: any) {
         setError(e?.message ?? "Gửi thất bại, vui lòng thử lại.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="space-y-5 p-5 bg-neutral-light min-h-full">
         {/* Header */}
         <div>
            <h1 className="text-[18px] font-bold text-primary flex items-center gap-2">
               <Bell size={18} className="text-accent" />
               Quản lý Thông báo
            </h1>
            <p className="mt-0.5 text-[12px] text-primary/50">
               Gửi campaign notification đến người dùng
            </p>
         </div>

         {/* Form card */}
         <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm max-w-2xl m-auto">
            <div className="px-5 py-3 border-b border-neutral flex items-center gap-2">
               <Megaphone size={15} className="text-accent shrink-0" />
               <h2 className="text-[13px] font-semibold text-primary">
                  Gửi Campaign Notification
               </h2>
            </div>

            <div className="p-5 space-y-4">
               {/* Title */}
               <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-primary/60">
                     Tiêu đề
                  </label>
                  <input
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="VD: Khuyến mãi mùa hè 50%!"
                     className="w-full rounded-xl border border-neutral px-3.5 py-2 text-[13px] text-primary bg-neutral-light placeholder-primary/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
               </div>

               {/* Body */}
               <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-primary/60">
                     Nội dung
                  </label>
                  <textarea
                     value={body}
                     onChange={(e) => setBody(e.target.value)}
                     rows={4}
                     placeholder="Nội dung thông báo hiển thị cho người dùng..."
                     className="w-full resize-none rounded-xl border border-neutral px-3.5 py-2 text-[13px] text-primary bg-neutral-light placeholder-primary/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
               </div>

               {/* Target toggle */}
               <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-primary/60">
                     Đối tượng
                  </label>
                  <div className="flex items-center gap-1.5 rounded-xl border border-neutral bg-neutral-light-active p-1">
                     <button
                        type="button"
                        onClick={() => setTargetAll(true)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-all cursor-pointer ${
                           targetAll
                              ? "bg-accent text-white shadow-sm"
                              : "text-primary/60 hover:bg-neutral-light"
                        }`}
                     >
                        <Users size={13} />
                        Tất cả người dùng
                     </button>
                     <button
                        type="button"
                        onClick={() => setTargetAll(false)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium transition-all cursor-pointer ${
                           !targetAll
                              ? "bg-accent text-white shadow-sm"
                              : "text-primary/60 hover:bg-neutral-light"
                        }`}
                     >
                        <Target size={13} />
                        Chọn theo ID
                     </button>
                  </div>
               </div>

               {/* User IDs */}
               {!targetAll && (
                  <div>
                     <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-primary/60">
                        User IDs{" "}
                        <span className="font-normal normal-case text-primary/40">
                           (mỗi ID trên 1 dòng hoặc cách nhau bằng dấu phẩy)
                        </span>
                     </label>
                     <textarea
                        value={userIdsRaw}
                        onChange={(e) => setUserIdsRaw(e.target.value)}
                        rows={4}
                        placeholder={"uuid-1\nuuid-2\nuuid-3"}
                        className="w-full resize-none rounded-xl border border-neutral px-3.5 py-2 font-mono text-[12px] text-primary bg-neutral-light placeholder-primary/30 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                     />
                  </div>
               )}

               {/* Feedback */}
               {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-promotion-light border border-promotion/20 px-3.5 py-2.5 text-[12px] text-promotion">
                     <AlertCircle size={13} className="shrink-0" />
                     {error}
                  </div>
               )}
               {success && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-[12px] text-emerald-700">
                     <CheckCircle2 size={13} className="shrink-0" />
                     {success}
                  </div>
               )}

               {/* Submit */}
               <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent-hover py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
               >
                  {loading ? (
                     <Loader2 size={14} className="animate-spin" />
                  ) : (
                     <Send size={14} />
                  )}
                  {loading ? "Đang gửi..." : "Gửi thông báo"}
               </button>
            </div>
         </div>
      </div>
   );
}
