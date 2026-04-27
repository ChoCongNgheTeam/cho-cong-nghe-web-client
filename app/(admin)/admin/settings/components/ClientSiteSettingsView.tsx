"use client";

import { useState } from "react";
import {
   Settings2,
   Layout,
   Megaphone,
   Search,
   Cookie,
   FileText,
   Save,
   Loader2,
   Globe,
   Tag,
   Image as ImageIcon,
   ToggleLeft,
} from "lucide-react";
import { useToasty } from "@/components/Toast";

const inputCls =
   "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";
const textareaCls =
   "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors resize-none";

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
   onSave?: () => void;
   saving?: boolean;
}) {
   return (
      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
         <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40">
            <div className="flex items-center gap-2.5">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
               </div>
               <div>
                  <h2 className="text-sm font-bold text-primary">{title}</h2>
                  {desc && (
                     <p className="text-xs text-neutral-dark mt-0.5">{desc}</p>
                  )}
               </div>
            </div>
         </div>
         <div className="px-6 py-6 space-y-5">
            {children}
            {onSave && (
               <div className="flex justify-end pt-1 border-t border-neutral">
                  <button
                     type="button"
                     onClick={onSave}
                     disabled={saving}
                     className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 shadow-sm active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                     {saving ? (
                        <>
                           <Loader2 className="h-4 w-4 animate-spin" />
                           Đang lưu...
                        </>
                     ) : (
                        <>
                           <Save className="h-4 w-4" />
                           Lưu cấu hình
                        </>
                     )}
                  </button>
               </div>
            )}
         </div>
      </section>
   );
}

function FieldLabel({
   children,
   hint,
}: {
   children: React.ReactNode;
   hint?: string;
}) {
   return (
      <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
         {children}
         {hint && (
            <span className="ml-1.5 normal-case font-normal text-neutral-dark/60">
               {hint}
            </span>
         )}
      </span>
   );
}

function ToggleRow({
   label,
   desc,
   checked,
   onChange,
}: {
   label: string;
   desc?: string;
   checked: boolean;
   onChange: (v: boolean) => void;
}) {
   return (
      <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
         <span>
            <span className="block text-sm font-medium text-primary">
               {label}
            </span>
            {desc && (
               <span className="block text-xs text-neutral-dark mt-0.5">
                  {desc}
               </span>
            )}
         </span>
         <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-accent ml-4 shrink-0"
         />
      </label>
   );
}

export default function ClientSiteSettingsView() {
   const { success } = useToasty();

   /* ── Display state ── */
   const [display, setDisplay] = useState({
      showBanner: true,
      showPopup: false,
      showAnnouncement: true,
      bannerText: "🎉 Miễn phí vận chuyển đơn từ 500.000đ",
      announcementText: "",
   });
   const [savingDisplay, setSavingDisplay] = useState(false);

   /* ── Search state ── */
   const [search, setSearch] = useState({
      enableSuggest: true,
      enableFilter: true,
      enableSort: true,
      defaultSort: "newest",
      minQueryLength: "2",
   });
   const [savingSearch, setSavingSearch] = useState(false);

   /* ── Cookie state ── */
   const [cookie, setCookie] = useState({
      showBanner: true,
      enableAnalytics: true,
      enableMarketing: false,
      policyUrl: "/chinh-sach-bao-mat",
   });
   const [savingCookie, setSavingCookie] = useState(false);

   /* ── SEO state ── */
   const [seo, setSeo] = useState({
      siteName: "Admin Dashboard",
      siteDesc: "Hệ thống quản trị",
      siteUrl: "https://example.com",
      ogImage: "",
      robotsTxt: "index, follow",
      canonicalEnabled: true,
   });
   const [savingSeo, setSavingSeo] = useState(false);

   const mockSave = async (setter: (v: boolean) => void, label: string) => {
      setter(true);
      await new Promise((r) => setTimeout(r, 900));
      setter(false);
      success(`Đã lưu cấu hình ${label}`);
   };

   return (
      <div className="space-y-6">
         {/* ── Display / Banner ── */}
         <SectionCard
            icon={Layout}
            title="Hiển thị site"
            desc="Quản lý banner, popup và thông báo trên trang client"
            onSave={() => mockSave(setSavingDisplay, "hiển thị")}
            saving={savingDisplay}
         >
            <div className="space-y-3">
               <ToggleRow
                  label="Hiển thị banner thông báo"
                  desc="Thanh thông báo nằm trên cùng trang"
                  checked={display.showBanner}
                  onChange={(v) => setDisplay((p) => ({ ...p, showBanner: v }))}
               />
               {display.showBanner && (
                  <div>
                     <FieldLabel>Nội dung banner</FieldLabel>
                     <input
                        value={display.bannerText}
                        onChange={(e) =>
                           setDisplay((p) => ({
                              ...p,
                              bannerText: e.target.value,
                           }))
                        }
                        placeholder="VD: 🎉 Miễn phí vận chuyển đơn từ 500.000đ"
                        className={inputCls}
                     />
                  </div>
               )}
               <ToggleRow
                  label="Hiển thị popup khuyến mãi"
                  desc="Popup xuất hiện khi người dùng vào trang lần đầu"
                  checked={display.showPopup}
                  onChange={(v) => setDisplay((p) => ({ ...p, showPopup: v }))}
               />
               <ToggleRow
                  label="Thông báo hệ thống"
                  desc="Hiện thông báo bảo trì hoặc cập nhật trên client"
                  checked={display.showAnnouncement}
                  onChange={(v) =>
                     setDisplay((p) => ({ ...p, showAnnouncement: v }))
                  }
               />
               {display.showAnnouncement && (
                  <div>
                     <FieldLabel hint="(để trống nếu không có)">
                        Nội dung thông báo
                     </FieldLabel>
                     <input
                        value={display.announcementText}
                        onChange={(e) =>
                           setDisplay((p) => ({
                              ...p,
                              announcementText: e.target.value,
                           }))
                        }
                        placeholder="VD: Hệ thống sẽ bảo trì lúc 23:00 ngày 30/04"
                        className={inputCls}
                     />
                  </div>
               )}
            </div>
         </SectionCard>

         {/* ── Search ── */}
         <SectionCard
            icon={Search}
            title="Tìm kiếm"
            desc="Cấu hình bộ lọc, gợi ý và sắp xếp cho trang tìm kiếm client"
            onSave={() => mockSave(setSavingSearch, "tìm kiếm")}
            saving={savingSearch}
         >
            <div className="space-y-3">
               <ToggleRow
                  label="Gợi ý tìm kiếm (Autocomplete)"
                  desc="Hiện danh sách gợi ý khi người dùng gõ"
                  checked={search.enableSuggest}
                  onChange={(v) =>
                     setSearch((p) => ({ ...p, enableSuggest: v }))
                  }
               />
               <ToggleRow
                  label="Bộ lọc sản phẩm"
                  desc="Cho phép lọc theo danh mục, giá, đánh giá"
                  checked={search.enableFilter}
                  onChange={(v) =>
                     setSearch((p) => ({ ...p, enableFilter: v }))
                  }
               />
               <ToggleRow
                  label="Sắp xếp kết quả"
                  desc="Cho phép người dùng chọn thứ tự hiển thị"
                  checked={search.enableSort}
                  onChange={(v) => setSearch((p) => ({ ...p, enableSort: v }))}
               />
               <div className="grid gap-4 sm:grid-cols-2 pt-1">
                  <div>
                     <FieldLabel>Sắp xếp mặc định</FieldLabel>
                     <div className="relative">
                        <select
                           value={search.defaultSort}
                           onChange={(e) =>
                              setSearch((p) => ({
                                 ...p,
                                 defaultSort: e.target.value,
                              }))
                           }
                           className="w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer pr-9"
                        >
                           <option value="newest">Mới nhất</option>
                           <option value="popular">Phổ biến nhất</option>
                           <option value="price_asc">Giá tăng dần</option>
                           <option value="price_desc">Giá giảm dần</option>
                           <option value="rating">Đánh giá cao nhất</option>
                        </select>
                        <svg
                           className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark"
                           viewBox="0 0 16 16"
                           fill="none"
                        >
                           <path
                              d="M4 6l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                           />
                        </svg>
                     </div>
                  </div>
                  <div>
                     <FieldLabel>Số ký tự tối thiểu để tìm</FieldLabel>
                     <input
                        type="number"
                        min={1}
                        max={5}
                        value={search.minQueryLength}
                        onChange={(e) =>
                           setSearch((p) => ({
                              ...p,
                              minQueryLength: e.target.value,
                           }))
                        }
                        className={inputCls}
                     />
                  </div>
               </div>
            </div>
         </SectionCard>

         {/* ── Cookie / GDPR ── */}
         <SectionCard
            icon={Cookie}
            title="Cookie & Quyền riêng tư"
            desc="Cấu hình banner đồng ý cookie và các tuỳ chọn theo dõi"
            onSave={() => mockSave(setSavingCookie, "cookie")}
            saving={savingCookie}
         >
            <div className="space-y-3">
               <ToggleRow
                  label="Hiện banner đồng ý cookie"
                  desc="Yêu cầu người dùng xác nhận chính sách cookie"
                  checked={cookie.showBanner}
                  onChange={(v) => setCookie((p) => ({ ...p, showBanner: v }))}
               />
               <ToggleRow
                  label="Cookie phân tích (Analytics)"
                  desc="Thu thập dữ liệu hành vi người dùng (Google Analytics...)"
                  checked={cookie.enableAnalytics}
                  onChange={(v) =>
                     setCookie((p) => ({ ...p, enableAnalytics: v }))
                  }
               />
               <ToggleRow
                  label="Cookie tiếp thị (Marketing)"
                  desc="Cho phép quảng cáo cá nhân hoá (Facebook Pixel...)"
                  checked={cookie.enableMarketing}
                  onChange={(v) =>
                     setCookie((p) => ({ ...p, enableMarketing: v }))
                  }
               />
               <div>
                  <FieldLabel>URL trang chính sách bảo mật</FieldLabel>
                  <input
                     value={cookie.policyUrl}
                     onChange={(e) =>
                        setCookie((p) => ({ ...p, policyUrl: e.target.value }))
                     }
                     placeholder="/chinh-sach-bao-mat"
                     className={inputCls}
                  />
               </div>
            </div>
         </SectionCard>

         {/* ── SEO / Meta ── */}
         <SectionCard
            icon={FileText}
            title="SEO & Meta"
            desc="Cấu hình thẻ meta, OG image và robots cho trang client"
            onSave={() => mockSave(setSavingSeo, "SEO")}
            saving={savingSeo}
         >
            <div className="grid gap-4 sm:grid-cols-2">
               <div>
                  <FieldLabel>Tên site</FieldLabel>
                  <input
                     value={seo.siteName}
                     onChange={(e) =>
                        setSeo((p) => ({ ...p, siteName: e.target.value }))
                     }
                     placeholder="Tên trang web"
                     className={inputCls}
                  />
               </div>
               <div>
                  <FieldLabel>URL gốc (Canonical)</FieldLabel>
                  <input
                     value={seo.siteUrl}
                     onChange={(e) =>
                        setSeo((p) => ({ ...p, siteUrl: e.target.value }))
                     }
                     placeholder="https://example.com"
                     className={inputCls}
                  />
               </div>
               <div className="sm:col-span-2">
                  <FieldLabel>Mô tả site (meta description)</FieldLabel>
                  <textarea
                     value={seo.siteDesc}
                     onChange={(e) =>
                        setSeo((p) => ({ ...p, siteDesc: e.target.value }))
                     }
                     placeholder="Mô tả ngắn gọn về trang web, hiển thị trên kết quả tìm kiếm"
                     rows={2}
                     className={textareaCls}
                  />
               </div>
               <div className="sm:col-span-2">
                  <FieldLabel>OG Image URL</FieldLabel>
                  <div className="flex gap-2">
                     <input
                        value={seo.ogImage}
                        onChange={(e) =>
                           setSeo((p) => ({ ...p, ogImage: e.target.value }))
                        }
                        placeholder="https://example.com/og-image.jpg (1200×630px)"
                        className={inputCls}
                     />
                     <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral bg-neutral-light-active px-3.5 py-2.5 text-sm font-medium text-primary hover:bg-neutral-light transition-colors shrink-0"
                     >
                        <ImageIcon className="h-4 w-4" />
                        Upload
                     </button>
                  </div>
               </div>
               <div>
                  <FieldLabel>Robots.txt</FieldLabel>
                  <div className="relative">
                     <select
                        value={seo.robotsTxt}
                        onChange={(e) =>
                           setSeo((p) => ({ ...p, robotsTxt: e.target.value }))
                        }
                        className="w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors cursor-pointer pr-9"
                     >
                        <option value="index, follow">
                           index, follow (Cho phép index)
                        </option>
                        <option value="noindex, follow">
                           noindex, follow (Không index)
                        </option>
                        <option value="noindex, nofollow">
                           noindex, nofollow (Chặn hoàn toàn)
                        </option>
                     </select>
                     <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark"
                        viewBox="0 0 16 16"
                        fill="none"
                     >
                        <path
                           d="M4 6l4 4 4-4"
                           stroke="currentColor"
                           strokeWidth="1.5"
                           strokeLinecap="round"
                        />
                     </svg>
                  </div>
               </div>
               <div className="flex items-end">
                  <ToggleRow
                     label="Canonical URL tự động"
                     desc="Tự động thêm thẻ canonical cho mỗi trang"
                     checked={seo.canonicalEnabled}
                     onChange={(v) =>
                        setSeo((p) => ({ ...p, canonicalEnabled: v }))
                     }
                  />
               </div>
            </div>
         </SectionCard>
      </div>
   );
}
