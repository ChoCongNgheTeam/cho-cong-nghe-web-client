"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, CheckCircle2 } from "lucide-react";
import { createPromotion } from "../_libs/promotions";
import { PromotionForm, DEFAULT_FORM, formToPayload, type PromotionFormData, type TargetSearchAPIs } from "../components/PromotionForm";
import type { EntityOption } from "../components/MultiSelectDropdown";
import apiRequest from "@/lib/api";

export async function fetchProductSearch(term: string): Promise<EntityOption[]> {
  const res = await apiRequest.get<{ data: any[] }>("/products", {
    params: { search: term, limit: 20 },
    noAuth: true,
  });
  return (res?.data ?? []).map((p) => ({ id: p.id, name: p.name, meta: p.sku ?? p.slug ?? undefined }));
}

export async function fetchAllCategories(): Promise<EntityOption[]> {
  const res = await apiRequest.get<{ data: any[] }>("/categories", {
    params: { limit: 200 },
    noAuth: true,
  });
  return (res?.data ?? []).map((c) => ({ id: c.id, name: c.name }));
}

export async function fetchAllBrands(): Promise<EntityOption[]> {
  const res = await apiRequest.get<{ data: any[] }>("/brands", { noAuth: true });
  return (res?.data ?? []).map((b) => ({ id: b.id, name: b.name }));
}

const searchAPIs: TargetSearchAPIs = {
  searchProducts: fetchProductSearch,
  loadCategories: fetchAllCategories,
  loadBrands: fetchAllBrands,
};

export default function NewPromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (form: PromotionFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      const res = await createPromotion(payload);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push(`/admin/promotions/${res.data.id}`);
      }, 1200);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tạo khuyến mãi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
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

      <div className="px-6 py-4 flex justify-center">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Tag size={18} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-primary">Tạo khuyến mãi mới</h1>
              <p className="text-[12px] text-neutral-dark">Điền thông tin để tạo chương trình khuyến mãi</p>
            </div>
          </div>

          <PromotionForm
            initialData={DEFAULT_FORM}
            onSubmit={handleSubmit}
            saving={saving}
            error={error}
            submitLabel="Tạo khuyến mãi"
            onCancel={() => router.push("/admin/promotions")}
            searchAPIs={searchAPIs}
          />
        </div>
      </div>

      {/* ── Toast thông báo ── */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white text-[13px] font-medium rounded-xl shadow-lg animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={16} />
          Tạo khuyến mãi thành công!
        </div>
      )}
    </div>
  );
}
