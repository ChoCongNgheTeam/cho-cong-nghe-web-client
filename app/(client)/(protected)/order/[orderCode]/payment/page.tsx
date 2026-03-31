"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Copy, CheckCheck, Landmark, Banknote, Package, MapPin, Tag, ChevronDown, ChevronUp } from "lucide-react";
import apiRequest from "@/lib/api";
import { formatDate, formatVND } from "@/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantAttribute {
  attributeOption: { value: string; attribute: { name: string } };
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  image: string | null;
  productVariant: {
    code: string;
    product: { name: string; slug: string };
    variantAttributes: VariantAttribute[];
  };
}

interface OrderData {
  orderCode: string;
  shippingContactName: string;
  shippingPhone: string;
  shippingProvince: string;
  shippingWard: string;
  shippingDetail: string;
  subtotalAmount: string;
  shippingFee: string;
  voucherDiscount: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
  paymentMethod: { name: string; description: string };
  voucher: { code: string; description: string } | null;
  bankTransferQrUrl: string | null;
  bankTransferContent: string | null;
  bankTransferExpiredAt: string | null;
  orderItems: OrderItem[];
  paymentMethodCode: string;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-1.5 p-1 rounded hover:bg-neutral transition-colors shrink-0 cursor-pointer"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5 text-neutral-darker" />}
    </button>
  );
}

function InfoRow({ label, value, highlight, copy = false }: { label: string; value: string; highlight?: boolean; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral last:border-0">
      <span className="text-sm text-neutral-darker shrink-0 w-36">{label}</span>
      <div className="flex items-center min-w-0 text-right">
        <span className={`text-sm break-all ${highlight ? "font-bold text-accent-dark text-base" : "font-medium text-primary"}`}>{value}</span>
        {copy && <CopyBtn text={value} />}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <h2 className="text-sm font-semibold text-primary">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderCode = params?.orderCode as string;

  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (!orderCode) return;
    (async () => {
      try {
        const res = await apiRequest.get<{
          success: boolean;
          data: OrderData;
        }>(`/orders/by-code/${orderCode}/payment-info`);
        // console.log(res);
        if (res?.success && res.data) setData(res.data);
        else setError("Không tìm thấy thông tin đơn hàng.");
      } catch {
        setError("Có lỗi xảy ra khi tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-neutral border-t-accent mb-3" />
          <p className="text-sm text-neutral-darker">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-promotion">{error ?? "Không tìm thấy đơn hàng."}</p>
          <button onClick={() => router.push("/profile/orders")} className="text-sm text-primary underline">
            Xem danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const isBankTransfer = data.paymentMethodCode.toUpperCase().includes("BANK_TRANSFER");
  const isCOD = data.paymentMethodCode.toUpperCase().includes("COD");
  const total = Number(data.totalAmount);
  const subtotal = Number(data.subtotalAmount);
  const shipping = Number(data.shippingFee);
  const voucher = Number(data.voucherDiscount);
  const tax = Math.max(0, total - subtotal + voucher - shipping);
  return (
    <div className="min-h-screen bg-neutral-light py-8 px-4">
      <div className="w-full max-w-lg mx-auto space-y-4">
        {/* ── Success Header ── */}
        <div className="bg-neutral-light-active rounded-2xl shadow-sm p-6 text-center space-y-3 border border-neutral">
          <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">Đặt hàng thành công 🎉</h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="text-sm text-neutral-darker">Mã đơn hàng:</span>
              <span className="text-sm font-semibold text-primary">#{data.orderCode}</span>
              <CopyBtn text={data.orderCode} />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-neutral rounded-lg px-4 py-2.5">
            {isCOD ? <Banknote className="w-4 h-4 text-primary shrink-0" /> : <Landmark className="w-4 h-4 text-primary shrink-0" />}
            <span className="text-sm font-medium text-primary">{data.paymentMethod.description}</span>
          </div>
        </div>

        {/* ── Bank Transfer Info ── */}
        {isBankTransfer && (
          <div className="bg-neutral-light-active rounded-2xl shadow-sm overflow-hidden border border-neutral">
            <SectionHeader icon={Landmark} title="Thông tin chuyển khoản" />
            <div className="p-5 space-y-4">
              {data.bankTransferQrUrl && (
                <div className="flex flex-col items-center gap-2">
                  <img src={data.bankTransferQrUrl} alt="QR chuyển khoản" className="w-52 h-52 rounded-xl border border-neutral object-contain" />
                  <p className="text-xs text-neutral-darker">Quét mã QR để chuyển khoản nhanh</p>
                </div>
              )}

              <div className="bg-neutral rounded-xl px-4 py-1">
                {data.bankName && <InfoRow label="Ngân hàng" value={data.bankName} copy />}
                {data.bankAccount && <InfoRow label="Số tài khoản" value={data.bankAccount} copy />}
                {data.bankHolder && <InfoRow label="Chủ tài khoản" value={data.bankHolder} />}
                <InfoRow label="Số tiền" value={`${new Intl.NumberFormat("vi-VN").format(total)} VND`} highlight copy />
                {data.bankTransferContent && <InfoRow label="Nội dung CK" value={data.bankTransferContent} copy />}
              </div>

              <div className="bg-promotion-light border border-promotion-light-active rounded-xl p-3">
                <p className="text-xs text-promotion-dark leading-relaxed">
                  ⚠️ Vui lòng ghi <strong>đúng nội dung chuyển khoản</strong> để đơn hàng được xử lý tự động.
                </p>
              </div>

              {data.bankTransferExpiredAt && (
                <p className="text-xs text-neutral-darker text-center">
                  Hết hạn lúc: <span className="font-medium text-primary">{new Date(data.bankTransferExpiredAt).toLocaleString("vi-VN")}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Order Items + Price Breakdown ── */}
        <div className="bg-neutral-light-active rounded-2xl shadow-sm overflow-hidden border border-neutral">
          <SectionHeader icon={Package} title="Chi tiết đơn hàng" />

          <button onClick={() => setShowItems((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral transition-colors border-b border-neutral cursor-pointer">
            <span className="text-sm text-neutral-darker">{data.orderItems.length} sản phẩm</span>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <span>{formatVND(subtotal)}</span>
              {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showItems && (
            <div className="divide-y divide-neutral">
              {data.orderItems.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-3.5">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-neutral shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-neutral shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary line-clamp-1">{item.productVariant.product.name}</p>
                    <p className="text-xs text-neutral-darker mt-0.5">{item.productVariant.variantAttributes.map((a) => a.attributeOption.value).join(" / ")}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-neutral-darker">x{item.quantity}</span>
                      <span className="text-sm font-semibold text-primary">{formatVND(Number(item.unitPrice))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 space-y-2.5 border-t border-neutral">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-darker">Tạm tính</span>
              <span className="text-primary">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-darker">Phí vận chuyển</span>
              <span className="text-primary">{shipping === 0 ? "Miễn phí" : formatVND(shipping)}</span>
            </div>
            {voucher > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-darker flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {data.voucher?.code ?? "Voucher"}
                </span>
                <span className="text-promotion font-medium">-{formatVND(voucher)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-darker">Thuế VAT (10%)</span>
                <span className="text-primary">{formatVND(tax)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2.5 border-t border-neutral">
              <span className="text-sm font-bold text-primary">Tổng cộng</span>
              <span className="text-base font-bold text-primary">{formatVND(total)}</span>
            </div>
          </div>
        </div>

        {/* ── Shipping Address ── */}
        <div className="bg-neutral-light-active rounded-2xl shadow-sm overflow-hidden border border-neutral">
          <SectionHeader icon={MapPin} title="Địa chỉ nhận hàng" />
          <div className="px-5 py-4">
            <p className="text-sm font-semibold text-primary">
              {data.shippingContactName}
              <span className="font-normal text-neutral-darker mx-1.5">•</span>
              {data.shippingPhone}
            </p>
            <p className="text-sm text-neutral-darker mt-1 leading-relaxed">{[data.shippingDetail, data.shippingWard, data.shippingProvince].filter(Boolean).join(", ")}</p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="space-y-3 pb-4">
          {isBankTransfer && (
            <button
              onClick={() => router.push("/profile/orders")}
              className="w-full bg-accent hover:bg-accent-hover active:bg-accent-active text-white font-semibold py-3.5 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Tôi đã chuyển khoản
            </button>
          )}
          <button
            onClick={() => router.push("/profile/orders")}
            className={`w-full font-semibold py-3.5 rounded-xl transition-colors text-sm cursor-pointer ${
              isBankTransfer ? "border border-neutral text-neutral-darker hover:bg-neutral" : "bg-primary-dark text-neutral-light hover:bg-primary-dark-hover active:bg-accent-active"
            }`}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
