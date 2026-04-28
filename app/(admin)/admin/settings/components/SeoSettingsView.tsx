"use client";

import { useState, useEffect } from "react";
import { Globe, BarChart2, Share2, Save, Loader2, ExternalLink } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { getSettings, updateSettings, parseSettings } from "../_libs/settings";
import type { SeoSettings } from "../_libs/settings";

const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const textareaCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors resize-none";

const DEFAULTS: SeoSettings = {
  meta_title: "",
  meta_description: "",
  og_image_url: "",
  google_analytics_id: "",
  facebook_pixel_id: "",
};

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
  onSave,
  saving,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
  children: React.ReactNode;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
      <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">{title}</h2>
          {desc && <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">
        {children}
        <div className="flex justify-end pt-2 border-t border-neutral">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-light hover:bg-primary/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-2 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

// Live SERP preview
function SerpPreview({ title, desc, url }: { title: string; desc: string; url: string }) {
  return (
    <div className="rounded-xl border border-neutral bg-neutral-light-active px-5 py-4 space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-dark mb-2">Preview Google Search</p>
      <p className="text-xs text-green-700 truncate">{url || "https://myshop.vn"}</p>
      <p className="text-base font-medium text-blue-600 truncate">{title || "Tiêu đề trang của bạn"}</p>
      <p className="text-xs text-neutral-dark line-clamp-2">{desc || "Mô tả trang sẽ hiện ra ở đây khi tìm kiếm trên Google..."}</p>
    </div>
  );
}

export default function SeoSettingsView() {
  const { success, error } = useToasty();
  const [form, setForm] = useState<SeoSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    getSettings("seo")
      .then((res) => setForm(parseSettings(res.data, DEFAULTS)))
      .catch(() => error("Không thể tải cài đặt SEO"))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveMeta = async () => {
    setSavingMeta(true);
    try {
      await updateSettings("seo", {
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        og_image_url: form.og_image_url,
      });
      success("Lưu cài đặt SEO thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSavingMeta(false);
    }
  };

  const saveTracking = async () => {
    setSavingTracking(true);
    try {
      await updateSettings("seo", {
        google_analytics_id: form.google_analytics_id,
        facebook_pixel_id: form.facebook_pixel_id,
      });
      success("Lưu mã tracking thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSavingTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Meta Tags ── */}
      <SectionCard icon={Globe} title="Meta Tags & OG" desc="Thông tin hiển thị khi chia sẻ hoặc tìm kiếm" onSave={saveMeta} saving={savingMeta}>
        <div className="space-y-4">
          <div>
            <FieldLabel hint={`${form.meta_title.length}/60 ký tự`}>Meta Title mặc định</FieldLabel>
            <input className={inputCls} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} maxLength={60} placeholder="My Shop — Mua sắm dễ dàng" />
          </div>
          <div>
            <FieldLabel hint={`${form.meta_description.length}/160 ký tự`}>Meta Description mặc định</FieldLabel>
            <textarea
              rows={3}
              className={textareaCls}
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              maxLength={160}
              placeholder="Mô tả ngắn về shop của bạn..."
            />
          </div>
          <div>
            <FieldLabel hint="URL ảnh OG dùng khi share Facebook/Zalo">OG Image URL</FieldLabel>
            <input className={inputCls} value={form.og_image_url} onChange={(e) => set("og_image_url", e.target.value)} placeholder="https://myshop.vn/og-image.jpg" />
          </div>
        </div>

        <SerpPreview title={form.meta_title} desc={form.meta_description} url="https://myshop.vn" />
      </SectionCard>

      {/* ── Tracking ── */}
      <SectionCard icon={BarChart2} title="Analytics & Tracking" desc="Kết nối Google Analytics và Facebook Pixel" onSave={saveTracking} saving={savingTracking}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>Google Analytics 4 — Measurement ID</FieldLabel>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                <ExternalLink className="h-3 w-3" />
                Mở GA4
              </a>
            </div>
            <input className={inputCls} value={form.google_analytics_id} onChange={(e) => set("google_analytics_id", e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>Facebook Pixel ID</FieldLabel>
              <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline">
                <ExternalLink className="h-3 w-3" />
                Events Manager
              </a>
            </div>
            <input className={inputCls} value={form.facebook_pixel_id} onChange={(e) => set("facebook_pixel_id", e.target.value)} placeholder="1234567890123456" />
          </div>
        </div>

        {(form.google_analytics_id || form.facebook_pixel_id) && (
          <div className="flex gap-3 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <Share2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-primary/70">Mã tracking được nhúng vào tất cả trang. Đảm bảo đã cập nhật chính sách Cookie nếu cần.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
