"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
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
import { getAllUsers } from "../users/_libs/getAllUsers";

interface UserOption {
   value: string;
   label: string;
   sub: string;
   isActive: boolean;
}

const rsStyles = {
   control: (b: any, s: any) => ({
      ...b,
      minHeight: "42px",
      borderRadius: "0.75rem",
      borderColor: s.isFocused
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-neutral, #e5e7eb)",
      boxShadow: s.isFocused
         ? "0 0 0 2px color-mix(in srgb, var(--color-accent, #0ea5e9) 20%, transparent)"
         : "none",
      backgroundColor: "var(--color-neutral-light, #fff)",
      "&:hover": { borderColor: "var(--color-accent-hover, #0369a1)" },
      transition: "border-color 0.15s, box-shadow 0.15s",
      cursor: "text",
      flexWrap: "wrap",
   }),
   valueContainer: (b: any) => ({
      ...b,
      padding: "4px 8px",
      gap: "4px",
      flexWrap: "wrap",
   }),
   multiValue: (b: any) => ({
      ...b,
      backgroundColor:
         "color-mix(in srgb, var(--color-accent, #0ea5e9) 12%, transparent)",
      borderRadius: "0.5rem",
      padding: "0 2px",
      margin: 0,
   }),
   multiValueLabel: (b: any) => ({
      ...b,
      color: "var(--color-accent-hover, #0369a1)",
      fontSize: "12px",
      fontWeight: 500,
      padding: "2px 4px",
   }),
   multiValueRemove: (b: any) => ({
      ...b,
      color: "var(--color-accent-hover, #0369a1)",
      borderRadius: "0 0.5rem 0.5rem 0",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "var(--color-accent-hover, #0369a1)",
         color: "#fff",
      },
   }),
   input: (b: any) => ({
      ...b,
      color: "var(--color-primary, #111827)",
      fontSize: "13px",
      margin: 0,
      padding: "2px 0",
   }),
   placeholder: (b: any) => ({
      ...b,
      color: "var(--color-neutral-dark, #9ca3af)",
      fontSize: "13px",
   }),
   menu: (b: any) => ({
      ...b,
      borderRadius: "0.75rem",
      border: "1px solid var(--color-neutral, #e5e7eb)",
      boxShadow:
         "0 10px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
      overflow: "hidden",
      // bỏ zIndex: 9999
      backgroundColor: "var(--color-neutral-light, #fff)",
      marginTop: "6px",
   }),
   menuList: (b: any) => ({
      ...b,
      padding: "4px",
      maxHeight: "260px",
   }),
   option: (b: any, s: any) => ({
      ...b,
      borderRadius: "0.5rem",
      padding: "6px 10px",
      backgroundColor: s.isSelected
         ? "color-mix(in srgb, var(--color-accent, #0ea5e9) 15%, transparent)"
         : s.isFocused
           ? "var(--color-neutral, #f3f4f6)"
           : "transparent",
      color: s.isSelected
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-primary, #111827)",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: s.isSelected ? 500 : 400,
      "&:active": { backgroundColor: "var(--color-neutral-hover, #e5e7eb)" },
   }),
   loadingMessage: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #6b7280)",
      fontSize: "13px",
      padding: "12px 16px",
   }),
   noOptionsMessage: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #6b7280)",
      fontSize: "13px",
      padding: "12px 16px",
   }),
   indicatorSeparator: () => ({ display: "none" }),
   dropdownIndicator: (b: any, s: any) => ({
      ...b,
      color: s.isFocused
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-neutral-darker, #9ca3af)",
      padding: "0 8px",
      transition: "color 0.15s, transform 0.2s",
      transform: s.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
   }),
   clearIndicator: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #9ca3af)",
      padding: "0 4px",
      cursor: "pointer",
      "&:hover": { color: "var(--color-primary, #111827)" },
   }),
};

function UserOptionLabel({ data }: { data: UserOption }) {
   return (
      <div className="flex items-center gap-2.5 py-0.5">
         <div className="shrink-0 w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-[11px] font-semibold text-accent uppercase">
            {data.label.charAt(0)}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-primary truncate leading-tight">
               {data.label}
            </p>
            <p className="text-[11px] text-neutral-darker truncate leading-tight">
               {data.sub}
            </p>
         </div>
         {!data.isActive && (
            <span className="shrink-0 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
               Inactive
            </span>
         )}
      </div>
   );
}

export default function NotificationAdmin() {
   const [title, setTitle] = useState("");
   const [body, setBody] = useState("");
   const [targetAll, setTargetAll] = useState(true);
   const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

   const [userOptions, setUserOptions] = useState<UserOption[]>([]);
   const [usersLoading, setUsersLoading] = useState(false);

   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   // Load CUSTOMER list khi switch sang "Chọn theo người dùng"
   useEffect(() => {
      if (targetAll || userOptions.length > 0) return;
      setUsersLoading(true);
      getAllUsers({ role: "CUSTOMER", limit: 100 })
         .then((res) =>
            setUserOptions(
               res.data.map((u) => ({
                  value: u.id,
                  label: u.fullName || u.userName,
                  sub: u.email,
                  isActive: u.isActive,
               })),
            ),
         )
         .finally(() => setUsersLoading(false));
   }, [targetAll]);

   const handleSubmit = async () => {
      if (!title.trim() || !body.trim()) {
         setError("Tiêu đề và nội dung không được để trống.");
         return;
      }
      if (!targetAll && selectedUsers.length === 0) {
         setError("Vui lòng chọn ít nhất 1 người dùng hoặc chọn gửi tất cả.");
         return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
         const res = await sendCampaign({
            title,
            body,
            targetAll,
            userIds: targetAll ? [] : selectedUsers.map((u) => u.value),
         });
         setSuccess(res.message);
         setTitle("");
         setBody("");
         setSelectedUsers([]);
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
                        Chọn theo người dùng
                     </button>
                  </div>
               </div>

               {/* User select */}
               {!targetAll && (
                  <div>
                     <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-primary/60">
                        <span>Người dùng</span>
                        {selectedUsers.length > 0 && (
                           <span className="normal-case font-normal text-accent">
                              Đã chọn {selectedUsers.length} người
                           </span>
                        )}
                     </label>
                     <Select
                        isMulti
                        options={userOptions}
                        value={selectedUsers}
                        onChange={(val: any) =>
                           setSelectedUsers(val ? [...val] : [])
                        }
                        isLoading={usersLoading}
                        placeholder="Tìm tên, email người dùng..."
                        styles={rsStyles}
                        formatOptionLabel={(opt: any) => (
                           <UserOptionLabel data={opt} />
                        )}
                        loadingMessage={() => "Đang tải..."}
                        noOptionsMessage={() => "Không có người dùng"}
                        isClearable
                        isSearchable
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        classNamePrefix="rs-user"
                        menuPortalTarget={
                           typeof document !== "undefined"
                              ? document.body
                              : null
                        }
                        menuPosition="fixed"
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
