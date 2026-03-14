"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { createPromotion } from "../_libs/promotions";
import { PromotionForm, DEFAULT_FORM, formToPayload, type PromotionFormData } from "../components/PromotionForm";

export default function NewPromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (form: PromotionFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      const res = await createPromotion(payload);
      router.push(`/admin/promotions/${res.data.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tạo khuyến mãi");
    } finally {
      setSaving(false);
    }
  };

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
        <Link href="/admin/promotions" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Khuyến mãi
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo mới</span>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Tag size={18} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-primary">Tạo khuyến mãi mới</h1>
              <p className="text-[12px] text-neutral-dark">Điền thông tin để tạo chương trình khuyến mãi</p>
            </div>
          </div>

          <PromotionForm initialData={DEFAULT_FORM} onSubmit={handleSubmit} saving={saving} error={error} submitLabel="Tạo khuyến mãi" onCancel={() => router.push("/admin/promotions")} />
        </div>
      </div>
    </div>
  );
}
