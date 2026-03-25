"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { createCampaign } from "../_libs/campaigns";
import { CampaignForm, DEFAULT_FORM, formToCreatePayload, type CampaignFormData } from "../components/CampaignForm";

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (form: CampaignFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = formToCreatePayload(form);
      const res = await createCampaign(payload);
      router.push(`/admin/campaigns/${res.data.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tạo chiến dịch");
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
        <Link href="/admin/campaigns" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Chiến dịch
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo mới</span>
      </div>

      {/* Content */}
      <div className="px-6 py-4 flex justify-center">
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Megaphone size={18} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-primary">Tạo chiến dịch mới</h1>
              <p className="text-[12px] text-neutral-dark">Điền thông tin để tạo chiến dịch marketing</p>
            </div>
          </div>

          <CampaignForm initialData={DEFAULT_FORM} onSubmit={handleSubmit} saving={saving} error={error} submitLabel="Tạo chiến dịch" onCancel={() => router.push("/admin/campaigns")} />
        </div>
      </div>
    </div>
  );
}
