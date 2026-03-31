"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket } from "lucide-react";
import { createVoucher } from "../_libs/vouchers";
import {
   VoucherForm,
   DEFAULT_FORM,
   formToCreatePayload,
   type VoucherFormData,
} from "../components/VoucherForm";
import { useToasty } from "@/components/Toast";

export default function NewVoucherPage() {
   const router = useRouter();
   const { success, error: toastError } = useToasty();

   const [saving, setSaving] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (form: VoucherFormData) => {
      setSaving(true);
      setError(null);
      try {
         const payload = formToCreatePayload(form);
         const res = await createVoucher(payload);
         success("Tạo voucher thành công!");
         setTimeout(() => {
            router.push(`/admin/vouchers/${res.data.id}`);
         }, 1200);
      } catch (e: any) {
         const msg = e?.message ?? "Không thể tạo voucher";
         setError(msg);
         toastError(msg);
      } finally {
         setSaving(false);
      }
   };

   return (
      <div className="min-h-screen bg-neutral-light">
         <div className="flex items-center gap-3 px-6 pt-5 pb-3">
            <button
               onClick={() => router.back()}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer"
            >
               <ArrowLeft size={14} /> Quay lại
            </button>
            <span className="text-neutral-dark text-[13px]">/</span>
            <Link
               href="/admin/vouchers"
               className="text-[13px] text-neutral-dark hover:text-accent"
            >
               Voucher
            </Link>
            <span className="text-neutral-dark text-[13px]">/</span>
            <span className="text-[13px] text-primary font-medium">
               Tạo mới
            </span>
         </div>

         <div className="px-6 py-4 flex justify-center">
            <div className="w-full">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <Ticket size={18} />
                  </div>
                  <div>
                     <h1 className="text-[18px] font-bold text-primary">
                        Tạo voucher mới
                     </h1>
                     <p className="text-[12px] text-neutral-dark">
                        Điền thông tin để tạo mã giảm giá
                     </p>
                  </div>
               </div>
               <VoucherForm
                  initialData={DEFAULT_FORM}
                  onSubmit={handleSubmit}
                  saving={saving}
                  error={error}
                  submitLabel="Tạo voucher"
                  onCancel={() => router.push("/admin/vouchers")}
               />
            </div>
         </div>
      </div>
   );
}
