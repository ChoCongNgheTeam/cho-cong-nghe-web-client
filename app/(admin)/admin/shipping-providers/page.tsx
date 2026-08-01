"use client";

import { useEffect, useState } from "react";
import { Cog, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { useToasty } from "@/components/toast";
import { getShippingProviders, upsertShippingProvider } from "./_lib/shipping-providers";
import { PROVIDER_OPTIONS, ENABLED_PROVIDERS } from "../shipments/_lib/constants";
import type { ShippingProviderCode } from "../shipments/shipment.types";

interface ProviderFormState {
  name: string;
  isActive: boolean;
  configText: string; // raw JSON text để edit tay
}

export default function ShippingProvidersPage() {
  const { success, error: toastError } = useToasty();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Partial<Record<ShippingProviderCode, ProviderFormState>>>({});
  const [savingCode, setSavingCode] = useState<ShippingProviderCode | null>(null);
  const [expandedCode, setExpandedCode] = useState<ShippingProviderCode | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await getShippingProviders();
      const nextForms: Partial<Record<ShippingProviderCode, ProviderFormState>> = {};
      for (const opt of PROVIDER_OPTIONS) {
        const existing = res.data.find((p) => p.code === opt.value);
        nextForms[opt.value] = {
          name: existing?.name ?? opt.label,
          isActive: existing?.isActive ?? false,
          configText: JSON.stringify(existing?.config ?? {}, null, 2),
        };
      }
      setForms(nextForms);
    } catch (err: unknown) {
      toastError((err as Error)?.message || "Không thể tải danh sách nhà vận chuyển");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateForm = (code: ShippingProviderCode, patch: Partial<ProviderFormState>) => {
    setForms((prev) => ({ ...prev, [code]: { ...prev[code]!, ...patch } }));
  };

  const handleSave = async (code: ShippingProviderCode) => {
    const form = forms[code];
    if (!form) return;

    let parsedConfig: Record<string, unknown>;
    try {
      parsedConfig = form.configText.trim() ? JSON.parse(form.configText) : {};
    } catch {
      toastError("Cấu hình (config) không phải JSON hợp lệ");
      return;
    }

    setSavingCode(code);
    try {
      await upsertShippingProvider({ code, name: form.name, isActive: form.isActive, config: parsedConfig });
      success(`Đã lưu cấu hình ${form.name}`);
      fetchProviders();
    } catch (err: unknown) {
      toastError((err as Error)?.message || "Không thể lưu cấu hình");
    } finally {
      setSavingCode(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-5 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <Cog size={18} />
        </div>
        <div>
          <h1 className="text-[18px] font-bold text-primary">Nhà vận chuyển</h1>
          <p className="text-[12px] text-primary">Bật/tắt và cấu hình các đơn vị vận chuyển</p>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-accent" />
          </div>
        ) : (
          PROVIDER_OPTIONS.map((opt) => {
            const form = forms[opt.value];
            if (!form) return null;
            const isExpanded = expandedCode === opt.value;
            const isEnabled = ENABLED_PROVIDERS.includes(opt.value);

            return (
              <div key={opt.value} className="bg-white border border-neutral rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-primary">{opt.label}</p>
                      {!isEnabled && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-light-active text-neutral-darker border border-neutral">Chưa hỗ trợ API thật</span>}
                    </div>
                    <input
                      value={form.name}
                      onChange={(e) => updateForm(opt.value, { name: e.target.value })}
                      className="mt-1.5 text-[12px] text-primary bg-transparent border-b border-transparent hover:border-neutral focus:border-accent focus:outline-none transition-colors w-64"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <span className="text-[12px] text-primary">{form.isActive ? "Đang bật" : "Đang tắt"}</span>
                    <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm(opt.value, { isActive: e.target.checked })} className="w-4 h-4 rounded accent-accent cursor-pointer" />
                  </label>

                  <button
                    onClick={() => setExpandedCode(isExpanded ? null : opt.value)}
                    className="flex items-center gap-1 px-3 py-2 text-[12px] text-primary hover:text-accent transition-colors cursor-pointer shrink-0"
                  >
                    Cấu hình {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    onClick={() => handleSave(opt.value)}
                    disabled={savingCode === opt.value}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[12px] font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    {savingCode === opt.value ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Lưu
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-neutral pt-4">
                    <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Config (JSON)</label>
                    <textarea
                      value={form.configText}
                      onChange={(e) => updateForm(opt.value, { configText: e.target.value })}
                      rows={6}
                      spellCheck={false}
                      className="mt-1.5 w-full px-3 py-2 text-[12px] font-mono border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-y"
                    />
                    <p className="text-[11px] text-neutral-dark mt-1.5">
                      Không lưu token/secret ở đây — token đọc từ biến môi trường phía server (GHN_TOKEN...). Trường config này chỉ dùng cho thông tin không nhạy cảm (ghi chú vận hành, shopId hiển thị...).
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
