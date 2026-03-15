"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Package, User, MapPin, CreditCard, Tag, Loader2, ShoppingCart } from "lucide-react";
import { createOrderAdmin, CreateOrderAdminPayload } from "../_libs/orders";

// ─── types local ──────────────────────────────────────────────────────────────
interface OrderItem {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}

type CustomerMode = "existing" | "new";

// ─── helpers ──────────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral bg-neutral-light-active">
        <Icon size={14} className="text-accent" />
        <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-primary">
        {label} {required && <span className="text-promotion">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all";

const selectCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all cursor-pointer";

// ─── page ─────────────────────────────────────────────────────────────────────
export default function CreateOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // customer mode
  const [mode, setMode] = useState<CustomerMode>("existing");

  // existing user
  const [userId, setUserId] = useState("");
  const [shippingAddressId, setShippingAddressId] = useState("");

  // new customer
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // new address
  const [provinceId, setProvinceId] = useState("");
  const [wardId, setWardId] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // order meta
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "PAID" | "REFUNDED">("UNPAID");
  const [orderStatus, setOrderStatus] = useState<"PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("PENDING");
  const [shippingFee, setShippingFee] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");

  // items
  const [items, setItems] = useState<OrderItem[]>([{ productVariantId: "", quantity: 1, unitPrice: 0 }]);

  const addItem = () => setItems((prev) => [...prev, { productVariantId: "", quantity: 1, unitPrice: 0 }]);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal + shippingFee;

  const handleSubmit = async () => {
    setError(null);

    // Basic validation
    if (items.some((i) => !i.productVariantId || i.quantity < 1 || i.unitPrice < 0)) {
      setError("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }
    if (!paymentMethodId) {
      setError("Vui lòng chọn phương thức thanh toán");
      return;
    }

    const payload: CreateOrderAdminPayload = {
      items,
      shippingFee,
      paymentMethodId,
      paymentStatus,
      orderStatus,
      ...(voucherCode ? { voucherCode } : {}),
    };

    if (mode === "existing") {
      if (!userId || !shippingAddressId) {
        setError("Vui lòng nhập User ID và Shipping Address ID");
        return;
      }
      payload.userId = userId;
      payload.shippingAddressId = shippingAddressId;
    } else {
      if (!fullName || !phone || !provinceId || !wardId || !detailAddress) {
        setError("Vui lòng điền đầy đủ thông tin khách hàng và địa chỉ");
        return;
      }
      payload.customerInfo = { fullName, phone, ...(email ? { email } : {}) };
      payload.newAddress = { provinceId, wardId, detailAddress };
    }

    setSubmitting(true);
    try {
      const res = await createOrderAdmin(payload);
      router.push(`/admin/orders/${res.data.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Tạo đơn hàng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-5 bg-neutral-light min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all">
          <ArrowLeft size={14} /> Quay lại
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/orders" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Đơn hàng
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo đơn mới</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
            <ShoppingCart size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-primary">Tạo đơn hàng</h1>
            <p className="text-[12px] text-neutral-dark">Tạo đơn hàng thay mặt khách hàng</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <div className="px-4 py-3 rounded-xl bg-promotion-light border border-promotion-light-active text-[13px] text-promotion">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ── Left col ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer mode toggle */}
          <SectionCard title="Thông tin khách hàng" icon={User}>
            <div className="flex gap-2 mb-1">
              {(["existing", "new"] as CustomerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    mode === m ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {m === "existing" ? "Khách hàng có sẵn" : "Khách hàng mới"}
                </button>
              ))}
            </div>

            {mode === "existing" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="User ID" required>
                  <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="UUID của khách hàng" className={inputCls} />
                </Field>
                <Field label="Shipping Address ID" required>
                  <input value={shippingAddressId} onChange={(e) => setShippingAddressId(e.target.value)} placeholder="UUID địa chỉ giao hàng" className={inputCls} />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Họ và tên" required>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" className={inputCls} />
                </Field>
                <Field label="Số điện thoại" required>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" className={inputCls} />
                </Field>
                <Field label="Email">
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className={inputCls} />
                </Field>
              </div>
            )}
          </SectionCard>

          {/* Address (chỉ khi new) */}
          {mode === "new" && (
            <SectionCard title="Địa chỉ giao hàng" icon={MapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Province ID" required>
                  <input value={provinceId} onChange={(e) => setProvinceId(e.target.value)} placeholder="UUID tỉnh/thành" className={inputCls} />
                </Field>
                <Field label="Ward ID" required>
                  <input value={wardId} onChange={(e) => setWardId(e.target.value)} placeholder="UUID phường/xã" className={inputCls} />
                </Field>
                <Field label="Địa chỉ chi tiết" required>
                  <input value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="Số nhà, tên đường..." className={`${inputCls} sm:col-span-2`} />
                </Field>
              </div>
            </SectionCard>
          )}

          {/* Items */}
          <SectionCard title="Sản phẩm" icon={Package}>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end p-3 rounded-xl bg-neutral-light-active border border-neutral">
                  <div className="col-span-5">
                    <Field label="Product Variant ID" required>
                      <input value={item.productVariantId} onChange={(e) => updateItem(idx, "productVariantId", e.target.value)} placeholder="UUID biến thể" className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-3">
                    <Field label="Đơn giá (₫)" required>
                      <input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2">
                    <Field label="SL" required>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className={inputCls} />
                    </Field>
                  </div>
                  <div className="col-span-2 flex justify-end pb-0.5">
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-promotion hover:bg-promotion-light transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-neutral text-[12px] text-neutral-dark hover:border-accent hover:text-accent transition-all cursor-pointer w-full justify-center"
            >
              <Plus size={13} /> Thêm sản phẩm
            </button>
          </SectionCard>
        </div>

        {/* ── Right col ── */}
        <div className="space-y-4">
          {/* Payment & status */}
          <SectionCard title="Thanh toán & Trạng thái" icon={CreditCard}>
            <Field label="Payment Method ID" required>
              <input value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} placeholder="UUID phương thức thanh toán" className={inputCls} />
            </Field>
            <Field label="Trạng thái thanh toán" required>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className={selectCls}>
                <option value="UNPAID">Chưa thanh toán</option>
                <option value="PAID">Đã thanh toán</option>
                <option value="REFUNDED">Đã hoàn tiền</option>
              </select>
            </Field>
            <Field label="Trạng thái đơn hàng" required>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as any)} className={selectCls}>
                <option value="PENDING">Chờ duyệt</option>
                <option value="PROCESSING">Đang xử lý</option>
                <option value="SHIPPED">Đang giao</option>
                <option value="DELIVERED">Hoàn tất</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </Field>
          </SectionCard>

          {/* Voucher & shipping */}
          <SectionCard title="Phí & Khuyến mãi" icon={Tag}>
            <Field label="Phí vận chuyển (₫)">
              <input type="number" min={0} value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Mã voucher">
              <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Nhập mã giảm giá (nếu có)" className={inputCls} />
            </Field>
          </SectionCard>

          {/* Summary */}
          <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-[12px] text-neutral-dark">
              <span>Tạm tính</span>
              <span className="font-medium text-primary">{new Intl.NumberFormat("vi-VN").format(subtotal)}₫</span>
            </div>
            <div className="flex justify-between text-[12px] text-neutral-dark">
              <span>Phí vận chuyển</span>
              <span className="font-medium text-primary">{new Intl.NumberFormat("vi-VN").format(shippingFee)}₫</span>
            </div>
            <div className="pt-2 border-t border-neutral flex justify-between">
              <span className="text-[13px] font-bold text-primary">Tổng cộng</span>
              <span className="text-[15px] font-bold text-accent">{new Intl.NumberFormat("vi-VN").format(total)}₫</span>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {submitting ? "Đang tạo đơn..." : "Tạo đơn hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
