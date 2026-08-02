"use client";

import { useState } from "react";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import type { ConsentCategories } from "@/lib/cookie-consent";

const CATEGORIES: { key: keyof ConsentCategories; label: string }[] = [
  { key: "preferences", label: "Ghi nhớ cài đặt và tùy chọn cá nhân" },
  { key: "personalization", label: "Nâng cao chất lượng dịch vụ và cá nhân hóa trải nghiệm" },
  { key: "marketing", label: "Cung cấp thông tin sản phẩm, dịch vụ, khuyến mại và quảng cáo phù hợp với sở thích của bạn" },
];

/**
 * Banner cookie consent — hiện ở cuối màn hình cho tới khi khách chọn 1 trong
 * 3 lựa chọn (Chấp nhận tất cả / Chỉ cần thiết / Tuỳ chỉnh rồi Lưu). Mount 1
 * lần ở app/(client)/(client)/layout.tsx.
 *
 * Mục "Nâng cao chất lượng dịch vụ và cá nhân hóa trải nghiệm" chính là cổng
 * bật/tắt cho module recommendation (xem lib/recommendation + lib/anon-id) —
 * nếu khách từ chối mục này, "Có thể bạn thích" vẫn hiển thị nhưng sẽ chỉ là
 * gợi ý bán chạy chung (không cá nhân hoá), và view-event/click không bị ghi log.
 */
export default function CookieConsentBanner() {
  const { showBanner, save } = useCookieConsent();
  const [expanded, setExpanded] = useState(false);
  const [choices, setChoices] = useState<ConsentCategories>({ preferences: true, personalization: true, marketing: false });

  if (!showBanner) return null;

  const toggle = (key: keyof ConsentCategories) => setChoices((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-surface border border-surface-border rounded-2xl shadow-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Cookie size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] sm:text-sm font-semibold text-primary">Cookie & trải nghiệm mua sắm</p>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1 leading-relaxed">
              Cookie được sử dụng nhằm ghi nhận các thiết lập cần thiết để website hoạt động ổn định và hỗ trợ trải nghiệm mua sắm thuận tiện hơn. Việc từ chối một số loại cookie có thể ảnh hưởng đến
              một số chức năng của website.
            </p>

            {expanded && (
              <div className="mt-3 space-y-2.5 border-t border-surface-border pt-3">
                {CATEGORIES.map((c) => (
                  <label key={c.key} className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={choices[c.key]} onChange={() => toggle(c.key)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer shrink-0" />
                    <span className="text-[12px] sm:text-[13px] text-primary">{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={() => save({ preferences: true, personalization: true, marketing: true })}
                className="px-4 py-2 rounded-xl bg-accent text-white text-[13px] font-semibold hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Chấp nhận tất cả
              </button>
              <button
                onClick={() => save({ preferences: false, personalization: false, marketing: false })}
                className="px-4 py-2 rounded-xl border border-surface-border text-[13px] font-medium text-primary hover:bg-black/5 transition-colors cursor-pointer"
              >
                Chỉ cần thiết
              </button>
              {!expanded ? (
                <button onClick={() => setExpanded(true)} className="px-4 py-2 text-[13px] font-medium text-accent hover:underline cursor-pointer">
                  Tuỳ chỉnh
                </button>
              ) : (
                <button onClick={() => save(choices)} className="px-4 py-2 rounded-xl border border-accent text-[13px] font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer">
                  Lưu lựa chọn của tôi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
