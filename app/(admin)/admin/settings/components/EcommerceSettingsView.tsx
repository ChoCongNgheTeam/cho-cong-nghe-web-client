"use client";

import { useState, useEffect } from "react";
import { Star, ShoppingCart, Users, Package, Wallet, FileText, Receipt, Save, Loader2 } from "lucide-react";
import { useToasty } from "@/components/Toast";
import { getSettings, updateSettings, parseSettings } from "../_libs/settings";
import type { EcommerceSettings, CheckoutSettings, CustomerSettings, OrderSettings, WalletSettings, InvoiceSettings, TaxSettings } from "../_libs/settings";

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-neutral bg-neutral-light px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-colors";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block text-xs font-semibold text-neutral-dark uppercase tracking-wide mb-1.5">
      {children}
      {hint && <span className="ml-2 normal-case font-normal text-neutral-dark/60">{hint}</span>}
    </span>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 cursor-pointer hover:bg-neutral-light transition-colors">
      <span>
        <span className="block text-sm font-medium text-primary">{label}</span>
        {desc && <span className="block text-xs text-neutral-dark mt-0.5">{desc}</span>}
      </span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent ml-4 shrink-0" />
    </label>
  );
}

function SectionCard({
  icon: Icon,
  title,
  desc,
  children,
  onSave,
  saving,
  loading,
}: {
  icon: React.ElementType;
  title: string;
  desc?: string;
  children: React.ReactNode;
  onSave: () => void;
  saving?: boolean;
  loading?: boolean;
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
      <div className="px-6 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}

// ─── Generic hook ─────────────────────────────────────────────────────────────
// Bỏ constraint phức tạp, dùng cast tại điểm gọi — tránh conflict với interface

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useGroup<T>(group: string, defaults: T) {
  const [data, setData] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToasty();

  useEffect(() => {
    getSettings(group)
      .then((res) => {
        // parseSettings nhận Record<string, unknown>, cast defaults sang đó
        const parsed = parseSettings(res.data, defaults as Record<string, unknown>);
        setData(parsed as T);
      })
      .catch(() => error(`Không thể tải cài đặt [${group}]`))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const set = <K extends keyof T>(key: K, value: T[K]) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      // cast sang Record để updateSettings nhận được
      await updateSettings(group, data as unknown as Record<string, string | boolean | number>);
      success("Lưu cài đặt thành công");
    } catch {
      error("Lưu thất bại, thử lại sau");
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, saving, set, save };
}

// ─── Products & Review ────────────────────────────────────────────────────────

const ECOMMERCE_DEFAULTS: EcommerceSettings = {
  default_currency: "VND",
  enable_product_review: true,
  enable_star_rating: true,
  require_star_rating: false,
  show_verified_label: true,
  review_verified_only: true,
  enable_product_compare: false,
  enable_product_discount: true,
  products_per_page: 20,
};

function ProductsSection() {
  const { data, loading, saving, set, save } = useGroup<EcommerceSettings>("ecommerce", ECOMMERCE_DEFAULTS);

  return (
    <SectionCard icon={Star} title="Sản phẩm & Đánh giá" desc="Cài đặt hiển thị sản phẩm và chức năng review" onSave={save} saving={saving} loading={loading}>
      <div className="space-y-3">
        <ToggleRow label="Cho phép đánh giá sản phẩm" desc="Khách hàng có thể gửi review sau khi mua" value={data.enable_product_review} onChange={(v) => set("enable_product_review", v)} />
        <ToggleRow label="Hiển thị sao đánh giá" desc="Hiển thị rating sao (1-5) trên trang sản phẩm" value={data.enable_star_rating} onChange={(v) => set("enable_star_rating", v)} />
        <ToggleRow label="Bắt buộc chọn số sao" desc="Người dùng phải chọn sao khi viết review" value={data.require_star_rating} onChange={(v) => set("require_star_rating", v)} />
        <ToggleRow label="Hiển thị nhãn 'Đã mua hàng'" desc="Gắn nhãn xác nhận cho người đã mua sản phẩm" value={data.show_verified_label} onChange={(v) => set("show_verified_label", v)} />
        <ToggleRow
          label="Chỉ người mua mới được review"
          desc="Chặn review từ tài khoản chưa đặt hàng sản phẩm này"
          value={data.review_verified_only}
          onChange={(v) => set("review_verified_only", v)}
        />
        <ToggleRow label="Cho phép so sánh sản phẩm" desc="Hiển thị nút so sánh trên listing" value={data.enable_product_compare} onChange={(v) => set("enable_product_compare", v)} />
        <ToggleRow label="Hiển thị giá giảm" desc="Hiển thị giá gốc và % giảm giá nếu có promotion" value={data.enable_product_discount} onChange={(v) => set("enable_product_discount", v)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-neutral">
        <div>
          <FieldLabel>Số sản phẩm mỗi trang</FieldLabel>
          <input type="number" min={4} max={100} className={inputCls} value={data.products_per_page} onChange={(e) => set("products_per_page", Number(e.target.value))} />
        </div>
        <div>
          <FieldLabel>Đơn vị tiền tệ</FieldLabel>
          <select className={inputCls} value={data.default_currency} onChange={(e) => set("default_currency", e.target.value)}>
            <option value="VND">VND — Việt Nam Đồng</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

const CHECKOUT_DEFAULTS: CheckoutSettings = {
  enable_billing_address: true,
  billing_same_as_shipping: true,
  enable_guest_checkout: false,
  mandatory_postcode: false,
  auto_create_account_guest: false,
  send_invoice_email: true,
  enable_coupon: true,
  enable_multi_coupon: false,
  enable_wallet: false,
  enable_order_note: true,
  enable_pickup_point: false,
  enable_min_order_amount: false,
  min_order_amount: 0,
};

function CheckoutSection() {
  const { data, loading, saving, set, save } = useGroup<CheckoutSettings>("checkout", CHECKOUT_DEFAULTS);

  return (
    <SectionCard icon={ShoppingCart} title="Thanh toán & Checkout" desc="Tuỳ chỉnh luồng thanh toán cho khách hàng" onSave={save} saving={saving} loading={loading}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-dark">Địa chỉ</p>
      <div className="space-y-3">
        <ToggleRow
          label="Cho phép địa chỉ thanh toán riêng"
          desc="Tách biệt địa chỉ giao hàng và địa chỉ thanh toán"
          value={data.enable_billing_address}
          onChange={(v) => set("enable_billing_address", v)}
        />
        <ToggleRow label="Mặc định địa chỉ thanh toán giống giao hàng" value={data.billing_same_as_shipping} onChange={(v) => set("billing_same_as_shipping", v)} />
        <ToggleRow label="Bắt buộc nhập mã bưu điện" value={data.mandatory_postcode} onChange={(v) => set("mandatory_postcode", v)} />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-dark pt-1 border-t border-neutral">Khách không đăng nhập</p>
      <div className="space-y-3">
        <ToggleRow label="Cho phép đặt hàng không cần tài khoản" desc="Guest checkout — không yêu cầu đăng ký" value={data.enable_guest_checkout} onChange={(v) => set("enable_guest_checkout", v)} />
        <ToggleRow
          label="Tự tạo tài khoản cho guest"
          desc="Tạo tài khoản tự động sau khi guest đặt hàng"
          value={data.auto_create_account_guest}
          onChange={(v) => set("auto_create_account_guest", v)}
        />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-dark pt-1 border-t border-neutral">Tính năng đơn hàng</p>
      <div className="space-y-3">
        <ToggleRow label="Gửi hóa đơn qua email" desc="Email xác nhận đơn hàng kèm hóa đơn PDF" value={data.send_invoice_email} onChange={(v) => set("send_invoice_email", v)} />
        <ToggleRow label="Cho phép dùng coupon" value={data.enable_coupon} onChange={(v) => set("enable_coupon", v)} />
        <ToggleRow label="Cho phép nhiều coupon / đơn" desc="Khách có thể áp dụng nhiều mã giảm giá cùng lúc" value={data.enable_multi_coupon} onChange={(v) => set("enable_multi_coupon", v)} />
        <ToggleRow label="Cho phép thanh toán bằng ví" value={data.enable_wallet} onChange={(v) => set("enable_wallet", v)} />
        <ToggleRow label="Cho phép ghi chú đơn hàng" value={data.enable_order_note} onChange={(v) => set("enable_order_note", v)} />
        <ToggleRow label="Cho phép chọn điểm lấy hàng" desc="Khách chọn điểm tự lấy thay vì giao tận nơi" value={data.enable_pickup_point} onChange={(v) => set("enable_pickup_point", v)} />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-dark pt-1 border-t border-neutral">Giá trị đơn hàng tối thiểu</p>
      <div className="space-y-3">
        <ToggleRow label="Bật giá trị đơn hàng tối thiểu" value={data.enable_min_order_amount} onChange={(v) => set("enable_min_order_amount", v)} />
        {data.enable_min_order_amount && (
          <div>
            <FieldLabel hint="VND">Giá trị tối thiểu</FieldLabel>
            <input type="number" min={0} className={inputCls} value={data.min_order_amount} onChange={(e) => set("min_order_amount", Number(e.target.value))} placeholder="50000" />
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── Customer ─────────────────────────────────────────────────────────────────

const CUSTOMER_DEFAULTS: CustomerSettings = {
  auto_approval: true,
  email_verification: false,
};

function CustomerSection() {
  const { data, loading, saving, set, save } = useGroup<CustomerSettings>("customer", CUSTOMER_DEFAULTS);

  return (
    <SectionCard icon={Users} title="Khách hàng" desc="Kiểm soát đăng ký và xác minh tài khoản" onSave={save} saving={saving} loading={loading}>
      <div className="space-y-3">
        <ToggleRow label="Tự động duyệt tài khoản mới" desc="Tài khoản được kích hoạt ngay sau khi đăng ký" value={data.auto_approval} onChange={(v) => set("auto_approval", v)} />
        <ToggleRow
          label="Bắt buộc xác minh email"
          desc="Gửi email xác nhận — tài khoản chưa xác minh không thể đặt hàng"
          value={data.email_verification}
          onChange={(v) => set("email_verification", v)}
        />
      </div>
    </SectionCard>
  );
}

// ─── Order ────────────────────────────────────────────────────────────────────

const ORDER_DEFAULTS: OrderSettings = {
  order_code_prefix: "ORD",
  order_code_separator: "-",
  cancel_within_minutes: 1440,
  return_within_days: 7,
};

function OrderSection() {
  const { data, loading, saving, set, save } = useGroup<OrderSettings>("order", ORDER_DEFAULTS);

  return (
    <SectionCard icon={Package} title="Đơn hàng" desc="Định dạng mã đơn, thời hạn hủy và hoàn trả" onSave={save} saving={saving} loading={loading}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel hint="VD: ORD">Tiền tố mã đơn hàng</FieldLabel>
          <input className={inputCls} value={data.order_code_prefix} onChange={(e) => set("order_code_prefix", e.target.value.toUpperCase())} maxLength={6} placeholder="ORD" />
        </div>
        <div>
          <FieldLabel hint="VD: -">Ký tự phân cách</FieldLabel>
          <input className={inputCls} value={data.order_code_separator} onChange={(e) => set("order_code_separator", e.target.value)} maxLength={2} placeholder="-" />
        </div>
      </div>

      <div className="rounded-xl border border-neutral bg-neutral-light-active px-4 py-2.5">
        <span className="text-xs text-neutral-dark">Preview mã đơn: </span>
        <span className="font-mono text-sm font-semibold text-primary">
          {data.order_code_prefix || "ORD"}
          {data.order_code_separator}20250428{data.order_code_separator}001
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-neutral">
        <div>
          <FieldLabel hint="phút">Thời hạn hủy đơn</FieldLabel>
          <input type="number" min={0} className={inputCls} value={data.cancel_within_minutes} onChange={(e) => set("cancel_within_minutes", Number(e.target.value))} />
          <p className="mt-1 text-xs text-neutral-dark">
            = {Math.floor(data.cancel_within_minutes / 60)} giờ {data.cancel_within_minutes % 60} phút
          </p>
        </div>
        <div>
          <FieldLabel hint="ngày">Thời hạn trả hàng</FieldLabel>
          <input type="number" min={0} className={inputCls} value={data.return_within_days} onChange={(e) => set("return_within_days", Number(e.target.value))} />
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

const WALLET_DEFAULTS: WalletSettings = {
  enable_online_recharge: false,
  enable_offline_recharge: false,
  min_recharge_amount: 10000,
};

function WalletSection() {
  const { data, loading, saving, set, save } = useGroup<WalletSettings>("wallet", WALLET_DEFAULTS);

  return (
    <SectionCard icon={Wallet} title="Ví điện tử" desc="Cho phép khách nạp tiền vào ví để thanh toán" onSave={save} saving={saving} loading={loading}>
      <div className="space-y-3">
        <ToggleRow label="Nạp ví qua cổng thanh toán online" desc="VNPay, MoMo, ZaloPay..." value={data.enable_online_recharge} onChange={(v) => set("enable_online_recharge", v)} />
        <ToggleRow label="Nạp ví chuyển khoản thủ công" desc="Admin xác nhận thủ công sau khi kiểm tra" value={data.enable_offline_recharge} onChange={(v) => set("enable_offline_recharge", v)} />
      </div>

      {(data.enable_online_recharge || data.enable_offline_recharge) && (
        <div className="pt-2 border-t border-neutral">
          <FieldLabel hint="VND">Số tiền nạp tối thiểu</FieldLabel>
          <input type="number" min={0} className={inputCls} value={data.min_recharge_amount} onChange={(e) => set("min_recharge_amount", Number(e.target.value))} />
        </div>
      )}
    </SectionCard>
  );
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

const INVOICE_DEFAULTS: InvoiceSettings = {
  business_email: "",
  business_phone: "",
  business_address: "",
  logo_url: "",
};

function InvoiceSection() {
  const { data, loading, saving, set, save } = useGroup<InvoiceSettings>("invoice", INVOICE_DEFAULTS);

  return (
    <SectionCard icon={FileText} title="Hóa đơn" desc="Thông tin in trên hóa đơn gửi cho khách" onSave={save} saving={saving} loading={loading}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Email doanh nghiệp</FieldLabel>
          <input type="email" className={inputCls} value={data.business_email} onChange={(e) => set("business_email", e.target.value)} placeholder="invoice@myshop.vn" />
        </div>
        <div>
          <FieldLabel>Số điện thoại</FieldLabel>
          <input className={inputCls} value={data.business_phone} onChange={(e) => set("business_phone", e.target.value)} placeholder="0909 000 000" />
        </div>
      </div>
      <div>
        <FieldLabel>Địa chỉ doanh nghiệp</FieldLabel>
        <input className={inputCls} value={data.business_address} onChange={(e) => set("business_address", e.target.value)} placeholder="123 Nguyễn Văn Linh, Q.7, TP.HCM" />
      </div>
    </SectionCard>
  );
}

// ─── Tax ──────────────────────────────────────────────────────────────────────

const TAX_DEFAULTS: TaxSettings = {
  enable_tax: false,
  tax_rate: 10,
};

function TaxSection() {
  const { data, loading, saving, set, save } = useGroup<TaxSettings>("tax", TAX_DEFAULTS);

  return (
    <SectionCard icon={Receipt} title="Thuế" desc="Áp dụng thuế VAT vào đơn hàng" onSave={save} saving={saving} loading={loading}>
      <ToggleRow label="Bật tính thuế" desc="Thuế sẽ được cộng vào tổng đơn hàng" value={data.enable_tax} onChange={(v) => set("enable_tax", v)} />
      {data.enable_tax && (
        <div>
          <FieldLabel hint="%">Tỷ lệ thuế VAT</FieldLabel>
          <input type="number" min={0} max={100} className={inputCls} value={data.tax_rate} onChange={(e) => set("tax_rate", Number(e.target.value))} />
        </div>
      )}
    </SectionCard>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function EcommerceSettingsView() {
  return (
    <div className="space-y-6">
      <ProductsSection />
      <CheckoutSection />
      <CustomerSection />
      <OrderSection />
      <WalletSection />
      <InvoiceSection />
      <TaxSection />
    </div>
  );
}
