"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Loader2 } from "lucide-react";
import { createCampaign, addCampaignCategories } from "../_libs/campaigns";
import { CampaignForm, DEFAULT_FORM, formToCreatePayload, type CampaignFormData } from "../components/CampaignForm";
import { CampaignCategoryDraft, type DraftCampaignCategory } from "../components/CampaignCategoryDraft";
import { useAdminHref } from "@/hooks/useAdminHref";
import { getAllCategories } from "../../categories/_libs/categories";

export default function NewCampaignPage() {
  const router = useRouter();
  const href = useAdminHref();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // draft categories — chưa gọi API, chỉ lưu local
  const [draftCategories, setDraftCategories] = useState<DraftCampaignCategory[]>([]);
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; slug: string; imageUrl?: string }>>([]);

  const fetchAllCategories = useCallback(async () => {
    try {
      const res = await getAllCategories();
      setAllCategories(
        (res.data ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl ?? undefined,
        })),
      );
    } catch {
      // silent — không block UI
    }
  }, []);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleSubmit = async (form: CampaignFormData) => {
    setSaving(true);
    setError(null);
    try {
      // 1. Tạo campaign
      const payload = formToCreatePayload(form);
      const res = await createCampaign(payload);
      const campaignId = res.data.id;

      // 2. Nếu có draft categories → thêm vào campaign vừa tạo
      if (draftCategories.length > 0) {
        await addCampaignCategories(
          campaignId,
          draftCategories.map((d) => ({
            categoryId: d.categoryId,
            position: d.position,
            title: d.title,
            description: d.description,
            image: d.image,
          })),
        );
      }

      router.push(href(`/campaigns/${campaignId}`));
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
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Megaphone size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Tạo chiến dịch mới</h1>
            <p className="text-[12px] text-neutral-dark">Điền thông tin và chọn danh mục cho chiến dịch</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Campaign form ── */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-light border border-neutral rounded-2xl p-6">
              <CampaignForm
                initialData={DEFAULT_FORM}
                onSubmit={handleSubmit}
                saving={saving}
                error={error}
                submitLabel={saving ? "Đang tạo..." : draftCategories.length > 0 ? `Tạo chiến dịch + ${draftCategories.length} danh mục` : "Tạo chiến dịch"}
                onCancel={() => router.push(href(`/campaigns`))}
              />
            </div>
          </div>

          {/* ── Right: Category draft ── */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 sticky top-4">
              <CampaignCategoryDraft availableCategories={allCategories} value={draftCategories} onChange={setDraftCategories} />
            </div>
          </div>
        </div>
      </div>

      {/* Saving overlay — chặn interaction khi đang gọi API */}
      {saving && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-neutral-light rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg border border-neutral">
            <Loader2 size={18} className="animate-spin text-accent" />
            <p className="text-[13px] font-medium text-primary">{draftCategories.length > 0 ? "Đang tạo chiến dịch và thêm danh mục..." : "Đang tạo chiến dịch..."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
