"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, MapPin, AlertCircle, CheckCircle2, Plus, DollarSign } from "lucide-react";
import Select from "react-select";
import { getOrderById, getUserAddresses, getProvinces, getWards, updateOrderAdmin, updateOrderShipping, type UserAddress, type Province, type Ward } from "../../_libs/orders";
import { formatVND } from "@/helpers";
import type { Order } from "../../order.types";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
      {children}
      {required && <span className="text-promotion ml-0.5">*</span>}
    </label>
  );
}
function inputCls(err?: boolean) {
  return `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${err ? "border-promotion" : "border-neutral"}`;
}
const rsStyles = () => ({
  control: (b: any) => ({
    ...b,
    borderRadius: "0.75rem",
    borderColor: "#d1d5db",
    boxShadow: "none",
    background: "var(--color-neutral-light,#fafafa)",
    "&:hover": { borderColor: "#9ca3af" },
    minHeight: "38px",
  }),
  valueContainer: (b: any) => ({ ...b, padding: "0.25rem 0.75rem" }),
  input: (b: any) => ({ ...b, margin: 0, padding: 0, fontSize: "13px" }),
  menu: (b: any) => ({ ...b, borderRadius: "0.75rem", marginTop: 4, boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", zIndex: 9999 }),
  option: (b: any, s: any) => ({ ...b, background: s.isSelected ? "#6366f1" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#111827", fontSize: "13px", padding: "8px 12px" }),
  singleValue: (b: any) => ({ ...b, fontSize: "13px" }),
  placeholder: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
});
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral bg-neutral-light-active/50">
        <span className="text-accent">{icon}</span>
        <p className="text-[13px] font-semibold text-primary">{title}</p>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-4">{children}</div>
    </div>
  );
}
interface SO {
  value: string;
  label: string;
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [manual, setManual] = useState({ contactName: "", phone: "", provinceId: "", wardId: "", detailAddress: "", provinceName: "", wardName: "" });
  const [shippingFee, setShippingFee] = useState("0");
  const [voucherDiscount, setVoucherDiscount] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    Promise.all([getOrderById(id), getProvinces()])
      .then(async ([oRes, pRes]) => {
        const o = oRes.data;
        setOrder(o);
        setShippingFee(String(Number(o.shippingFee)));
        setVoucherDiscount(String(Number(o.voucherDiscount)));
        setProvinces(pRes.data ?? []);
        setManual({
          contactName: o.shippingContactName,
          phone: o.shippingPhone,
          provinceId: "",
          wardId: "",
          detailAddress: o.shippingDetail,
          provinceName: o.shippingProvince,
          wardName: o.shippingWard,
        });
        if (o.userId) {
          try {
            const ar = await getUserAddresses(o.userId);
            setAddresses(ar.data ?? []);
          } catch {}
        }
      })
      .catch((e) => setError(e?.message ?? "Lỗi tải đơn"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!manual.provinceId) {
      setWards([]);
      return;
    }
    getWards(manual.provinceId)
      .then((r) => setWards(r.data ?? []))
      .catch(console.error);
  }, [manual.provinceId]);

  const canEdit = order?.orderStatus === "PENDING" || order?.orderStatus === "PROCESSING";

  const validate = () => {
    const errs: Record<string, string> = {};
    if (showManual) {
      if (!manual.contactName.trim()) errs.contactName = "Họ tên không được trống";
      if (!manual.phone.trim()) errs.phone = "SĐT không được trống";
      if (!manual.detailAddress.trim()) errs.detailAddress = "Địa chỉ chi tiết không được trống";
    }
    if (Number(shippingFee) < 0) errs.shippingFee = "Phí ship không được âm";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!order || !validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateOrderAdmin(order.id, { shippingFee: Number(shippingFee), voucherDiscount: Number(voucherDiscount) });
      if (selectedAddrId) {
        await updateOrderShipping(order.id, { shippingAddressId: selectedAddrId });
      } else if (showManual) {
        const prov = manual.provinceId ? provinces.find((p) => p.id === manual.provinceId) : null;
        const ward = manual.wardId ? wards.find((w) => w.id === manual.wardId) : null;
        await updateOrderShipping(order.id, {
          shippingContactName: manual.contactName.trim(),
          shippingPhone: manual.phone.trim(),
          shippingDetail: manual.detailAddress.trim(),
          shippingProvince: prov?.fullName ?? manual.provinceName,
          shippingWard: ward?.fullName ?? manual.wardName,
        });
      }
      router.push(`/admin/orders/${order.id}`);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  if (error || !order)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Package size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy đơn hàng"}</p>
      </div>
    );
  if (!canEdit)
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <Package size={40} className="text-neutral-dark opacity-40 mx-auto" />
          <p className="text-[14px] font-semibold text-primary">Không thể chỉnh sửa</p>
          <p className="text-[13px] text-neutral-dark">Chỉ có thể sửa đơn ở trạng thái Chờ duyệt hoặc Đang xử lý.</p>
          <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-[13px] mt-2 cursor-pointer">
            <ArrowLeft size={14} /> Quay lại
          </Link>
        </div>
      </div>
    );

  const newTotal = Number(order.subtotalAmount) + (Number(shippingFee) || 0) - (Number(voucherDiscount) || 0);

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark">/</span>
        <Link href="/admin/orders" className="text-[13px] text-neutral-dark hover:text-accent">
          Đơn hàng
        </Link>
        <span className="text-neutral-dark">/</span>
        <Link href={`/admin/orders/${order.id}`} className="text-[13px] text-neutral-dark hover:text-accent">
          #{order.orderCode}
        </Link>
        <span className="text-neutral-dark">/</span>
        <span className="text-[13px] text-primary font-medium">Chỉnh sửa</span>
      </div>

      <div className="px-6 py-4 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-[20px] font-bold text-primary">Chỉnh sửa đơn #{order.orderCode}</h1>
          <p className="text-[13px] text-neutral-dark mt-1">Trạng thái: {order.orderStatus === "PENDING" ? "Chờ duyệt" : "Đang xử lý"}</p>
        </div>

        {/* Địa chỉ */}
        <SectionCard title="Địa chỉ giao hàng" icon={<MapPin size={15} />}>
          <div className="p-3 rounded-xl bg-neutral-light-active border border-neutral">
            <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1.5">Hiện tại</p>
            <p className="text-[13px] font-medium text-primary">
              {order.shippingContactName} · {order.shippingPhone}
            </p>
            <p className="text-[12px] text-neutral-dark mt-0.5">
              {order.shippingDetail}, {order.shippingWard}, {order.shippingProvince}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-neutral" />
            <span className="text-[11px] text-neutral-dark px-2">Cập nhật sang</span>
            <div className="h-px flex-1 bg-neutral" />
          </div>
          {addresses.length > 0 && !showManual && (
            <div className="space-y-2">
              <Label>Địa chỉ đã lưu của khách hàng</Label>
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddrId === a.id ? "border-accent bg-accent/5" : "border-neutral hover:border-accent/50"}`}
                >
                  <input type="radio" name="addr" checked={selectedAddrId === a.id} onChange={() => setSelectedAddrId(a.id)} className="mt-0.5 accent-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-primary">
                      {a.contactName} · {a.phone}
                      {a.isDefault && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Mặc định</span>}
                    </p>
                    <p className="text-[12px] text-neutral-dark mt-0.5">
                      {a.detailAddress}, {a.ward.name}, {a.province.name}
                    </p>
                  </div>
                </label>
              ))}
              <button
                onClick={() => {
                  setShowManual(true);
                  setSelectedAddrId(null);
                }}
                className="flex items-center gap-1 text-[12px] text-accent hover:underline cursor-pointer"
              >
                <Plus size={11} /> Nhập địa chỉ khác
              </button>
            </div>
          )}
          {(showManual || addresses.length === 0) && (
            <div className="space-y-3">
              {addresses.length > 0 && (
                <button onClick={() => setShowManual(false)} className="text-[12px] text-accent hover:underline cursor-pointer">
                  ← Dùng địa chỉ đã lưu
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label required>Họ tên</Label>
                  <input value={manual.contactName} onChange={(e) => setManual((p) => ({ ...p, contactName: e.target.value }))} className={inputCls(!!errors.contactName)} />
                  {errors.contactName && <p className="text-[11px] text-promotion mt-1">{errors.contactName}</p>}
                </div>
                <div>
                  <Label required>Số điện thoại</Label>
                  <input value={manual.phone} onChange={(e) => setManual((p) => ({ ...p, phone: e.target.value }))} className={inputCls(!!errors.phone)} />
                  {errors.phone && <p className="text-[11px] text-promotion mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tỉnh / Thành phố</Label>
                  <Select
                    options={provinces.map((p) => ({ value: p.id, label: p.fullName }))}
                    value={manual.provinceId ? { value: manual.provinceId, label: provinces.find((p) => p.id === manual.provinceId)?.fullName ?? "" } : null}
                    onChange={(o: SO | null) => setManual((p) => ({ ...p, provinceId: o?.value ?? "", provinceName: o?.label ?? "", wardId: "", wardName: "" }))}
                    placeholder={manual.provinceName || "— Chọn —"}
                    isSearchable
                    styles={rsStyles()}
                    noOptionsMessage={() => "Không tìm thấy"}
                  />
                  <p className="text-[11px] text-neutral-dark mt-1">Hiện tại: {manual.provinceName || order.shippingProvince}</p>
                </div>
                <div>
                  <Label>Phường / Xã</Label>
                  <Select
                    options={wards.map((w) => ({ value: w.id, label: w.fullName }))}
                    value={manual.wardId ? { value: manual.wardId, label: wards.find((w) => w.id === manual.wardId)?.fullName ?? "" } : null}
                    onChange={(o: SO | null) => setManual((p) => ({ ...p, wardId: o?.value ?? "", wardName: o?.label ?? "" }))}
                    placeholder={manual.wardName || "— Chọn —"}
                    isDisabled={!manual.provinceId}
                    isSearchable
                    styles={rsStyles()}
                    noOptionsMessage={() => "Không tìm thấy"}
                  />
                  <p className="text-[11px] text-neutral-dark mt-1">Hiện tại: {manual.wardName || order.shippingWard}</p>
                </div>
              </div>
              <div>
                <Label required>Địa chỉ chi tiết</Label>
                <input value={manual.detailAddress} onChange={(e) => setManual((p) => ({ ...p, detailAddress: e.target.value }))} className={inputCls(!!errors.detailAddress)} />
                {errors.detailAddress && <p className="text-[11px] text-promotion mt-1">{errors.detailAddress}</p>}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Tài chính */}
        <SectionCard title="Tài chính" icon={<DollarSign size={15} />}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phí vận chuyển</Label>
              <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="0" className={inputCls(!!errors.shippingFee)} />
              {errors.shippingFee && <p className="text-[11px] text-promotion mt-1">{errors.shippingFee}</p>}
            </div>
            <div>
              <Label>Giảm voucher (override)</Label>
              <input type="number" value={voucherDiscount} onChange={(e) => setVoucherDiscount(e.target.value)} placeholder="0" className={inputCls()} />
              <p className="text-[11px] text-neutral-dark mt-1">Hiện tại: {formatVND(Number(order.voucherDiscount))}</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 space-y-1.5">
            <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Tổng mới</p>
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-dark">Tạm tính</span>
              <span>{formatVND(Number(order.subtotalAmount))}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-neutral-dark">+ Phí ship</span>
              <span>{formatVND(Number(shippingFee) || 0)}</span>
            </div>
            {Number(voucherDiscount) > 0 && (
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-dark">− Voucher</span>
                <span className="text-emerald-600">- {formatVND(Number(voucherDiscount))}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-accent/20">
              <span className="text-[14px] font-bold text-primary">Tổng</span>
              <span className="text-[16px] font-bold text-accent">{formatVND(newTotal)}</span>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Lưu ý về địa chỉ</p>
            <p className="text-amber-600">
              Cập nhật địa chỉ cần BE mở thêm shipping fields trong <span className="font-mono">updateOrderAdminSchema</span>. Phí ship và voucher discount sẽ lưu ngay.
            </p>
          </div>
        </div>

        {submitError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
            <AlertCircle size={13} /> {submitError}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end pb-6">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-xl cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
