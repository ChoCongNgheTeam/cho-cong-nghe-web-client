"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Plus,
  DollarSign,
  Search,
} from "lucide-react";
import Select from "react-select";
import {
  createOrder,
  getProvinces,
  getWards,
  getUserAddresses,
  Province,
  Ward,
  UserAddress,
} from "../_libs/orders";

export default function CreateOrderPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // User & cart
  const [userId, setUserId] = useState("");
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [cartInput, setCartInput] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [voucherId, setVoucherId] = useState("");

  // Address
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  // New address form
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState("");   // ← code
  const [wardCode, setWardCode] = useState("");           // ← code
  const [detailAddress, setDetailAddress] = useState("");

  // Location dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces từ open-api.vn
  useEffect(() => {
    if (!useNewAddress) return;
    const load = async () => {
      setIsLoadingProvinces(true);
      try {
        setProvinces(await getProvinces());
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    load();
  }, [useNewAddress]);

  // Load wards khi provinceCode thay đổi
  useEffect(() => {
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const load = async () => {
      setIsLoadingWards(true);
      try {
        setWards(await getWards(provinceCode));   // ← truyền code
      } finally {
        setIsLoadingWards(false);
      }
    };
    load();
  }, [provinceCode]);   // ← dependency = provinceCode

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);   // ← lưu code
    setWardCode("");         // ← reset ward code
    setWards([]);
  };

  const handleLoadAddresses = async () => {
    if (!userId) return;
    setIsLoadingAddresses(true);
    try {
      const addrs = await getUserAddresses(userId);
      setSavedAddresses(addrs);
      if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
    } catch {
      setSavedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddCartItem = () => {
    const trimmed = cartInput.trim();
    if (!trimmed || cartItemIds.includes(trimmed)) return;
    setCartItemIds((prev) => [...prev, trimmed]);
    setCartInput("");
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItemIds((prev) => prev.filter((i) => i !== id));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!userId) { setError("Vui lòng nhập User ID"); return; }
    if (cartItemIds.length === 0) { setError("Vui lòng thêm ít nhất 1 sản phẩm"); return; }
    if (!paymentMethodId) { setError("Vui lòng nhập Payment Method ID"); return; }

    const payload: any = {
      userId,
      cartItemIds,
      paymentMethodId,
      voucherId: voucherId || undefined,
    };

    if (useNewAddress) {
      if (!contactName || !phone || !provinceCode || !wardCode || !detailAddress) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ mới");
        return;
      }
      payload.newAddress = {
        contactName,
        phone,
        provinceCode,   // ← gửi code
        wardCode,       // ← gửi code
        detailAddress,
        type: "HOME",
      };
    } else {
      if (!selectedAddressId) { setError("Vui lòng chọn địa chỉ giao hàng"); return; }
      payload.shippingAddressId = selectedAddressId;
    }

    setIsSubmitting(true);
    try {
      await createOrder(payload);
      setSuccess(true);
      setTimeout(() => router.push("/admin/orders"), 1500);
    } catch (e: any) {
      setError(e?.message ?? "Tạo đơn thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const provinceOptions = provinces.map((p) => ({
    value: p.code,    // ← code
    label: p.fullName,
  }));
  const wardOptions = wards.map((w) => ({
    value: w.code,    // ← code
    label: w.fullName,
  }));

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold">Tạo đơn hàng mới</h1>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 size={16} />
          Tạo đơn thành công! Đang chuyển hướng...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Thông tin khách hàng */}
      <div className="border rounded-xl p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <Search size={16} />
          Khách hàng
        </h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            onClick={handleLoadAddresses}
            disabled={!userId || isLoadingAddresses}
            className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingAddresses ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MapPin size={14} />
            )}
            Tải địa chỉ
          </button>
        </div>
      </div>

      {/* Giỏ hàng */}
      <div className="border rounded-xl p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <Package size={16} />
          Sản phẩm
        </h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="Cart Item ID"
            value={cartInput}
            onChange={(e) => setCartInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCartItem()}
          />
          <button
            onClick={handleAddCartItem}
            className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-1"
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
        {cartItemIds.length > 0 && (
          <ul className="space-y-2">
            {cartItemIds.map((id) => (
              <li
                key={id}
                className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="font-mono text-xs text-gray-600 truncate flex-1 mr-2">
                  {id}
                </span>
                <button
                  onClick={() => handleRemoveCartItem(id)}
                  className="text-red-400 hover:text-red-600 shrink-0"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Thanh toán */}
      <div className="border rounded-xl p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <DollarSign size={16} />
          Thanh toán
        </h2>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Payment Method ID"
          value={paymentMethodId}
          onChange={(e) => setPaymentMethodId(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Voucher ID (tuỳ chọn)"
          value={voucherId}
          onChange={(e) => setVoucherId(e.target.value)}
        />
      </div>

      {/* Địa chỉ giao hàng */}
      <div className="border rounded-xl p-4 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <MapPin size={16} />
          Địa chỉ giao hàng
        </h2>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!useNewAddress}
              onChange={() => setUseNewAddress(false)}
              className="accent-black"
            />
            Dùng địa chỉ đã lưu
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={useNewAddress}
              onChange={() => setUseNewAddress(true)}
              className="accent-black"
            />
            Nhập địa chỉ mới
          </label>
        </div>

        {!useNewAddress ? (
          savedAddresses.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nhập User ID và bấm &quot;Tải địa chỉ&quot; để xem danh sách
            </p>
          ) : (
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {savedAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.contactName} — {a.fullAddress ?? a.detailAddress}
                </option>
              ))}
            </select>
          )
        ) : (
          <div className="space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Họ và tên"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {isLoadingProvinces ? (
              <div className="text-sm text-gray-400 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Loader2 size={14} className="animate-spin" /> Đang tải tỉnh thành...
              </div>
            ) : (
              <Select
                options={provinceOptions}
                value={provinceOptions.find((o) => o.value === provinceCode) ?? null}   // ← so sánh code
                onChange={(opt) => handleProvinceChange(opt?.value ?? "")}
                placeholder="Chọn tỉnh/thành phố"
                isSearchable
              />
            )}
            {isLoadingWards ? (
              <div className="text-sm text-gray-400 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Loader2 size={14} className="animate-spin" /> Đang tải phường xã...
              </div>
            ) : (
              <Select
                options={wardOptions}
                value={wardOptions.find((o) => o.value === wardCode) ?? null}   // ← so sánh code
                onChange={(opt) => setWardCode(opt?.value ?? "")}
                placeholder={provinceCode ? "Chọn phường/xã" : "Chọn tỉnh trước"}   // ← dùng provinceCode
                isDisabled={!provinceCode}   // ← dùng provinceCode
                isSearchable
              />
            )}
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Địa chỉ chi tiết (số nhà, tên đường...)"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/orders"
          className="flex-1 text-center border rounded-lg py-2.5 text-sm hover:bg-gray-50"
        >
          Hủy
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || success}
          className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {isSubmitting ? "Đang tạo..." : "Tạo đơn hàng"}
        </button>
      </div>
    </div>
  );
}