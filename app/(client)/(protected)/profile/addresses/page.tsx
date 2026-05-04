"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  Home,
  Building2,
  Plus,
  Star,
  Pencil,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Search,
} from "lucide-react";
import apiRequest from "@/lib/api";
import { getProvinces } from "../_lib/get-provice";
import { getWards } from "../_lib/get-wards";
import Popzy from "@/components/Modal/Popzy";

interface Province {
  code: string;
  name: string;
  fullName: string;
}

interface Ward {
  code: string;
  name: string;
  fullName: string;
}

interface Address {
  id: string;
  contactName: string;
  phone: string;
  province: { code: string; name: string; fullName?: string };
  ward: { code: string; name: string; fullName?: string };
  detailAddress: string;
  fullAddress: string;
  type: "HOME" | "OFFICE" | "OTHER";
  isDefault: boolean;
}

const ADDRESS_TYPES = [
  { value: "HOME", label: "Nhà riêng", icon: Home },
  { value: "OFFICE", label: "Văn phòng", icon: Building2 },
  { value: "OTHER", label: "Khác", icon: MapPin },
];

const inputCls =
  "w-full px-3 py-2.5 rounded-lg text-sm bg-neutral-light border border-neutral text-primary placeholder:text-neutral-dark focus:outline-none focus:border-accent focus:ring-0 transition-colors";

const selectTriggerCls =
  "w-full px-3 py-2.5 rounded-lg text-sm bg-neutral-light border border-neutral text-primary focus:outline-none focus:border-accent focus:ring-0 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between";

// ─── Custom searchable select — renders dropdown via Portal ───────────────────
function SelectDown({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = search.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight: 280,
      zIndex: 99999,
    });
  }, []);

  const openDropdown = () => {
    if (disabled) return;
    calcPosition();
    setSearch("");
    setOpen(true);
  };

  // Focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => calcPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, calcPosition]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        disabled={disabled}
        className={selectTriggerCls}
      >
        <span className={selected ? "text-primary" : "text-neutral-dark"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-dark shrink-0 ml-2 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={listRef}
            style={dropStyle}
            className="bg-white border border-neutral rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-b border-neutral shrink-0">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-neutral bg-neutral-light">
                <Search size={13} className="text-neutral-dark shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="flex-1 text-sm bg-transparent outline-none text-primary placeholder:text-neutral-dark"
                />
              </div>
            </div>

            {/* Options list */}
            <ul className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-3 text-sm text-neutral-dark text-center">
                  Không tìm thấy kết quả
                </li>
              ) : (
                filteredOptions.map((o) => (
                  <li
                    key={o.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(o.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-accent-light transition-colors ${
                      o.value === value
                        ? "text-accent font-semibold bg-accent-light"
                        : "text-primary"
                    }`}
                  >
                    {o.label}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [type, setType] = useState<"HOME" | "OFFICE" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const [wardLoadTrigger, setWardLoadTrigger] = useState<{
    code: string;
    afterLoad?: string;
  } | null>(null);

  // ─── Fetch addresses ───────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest.get<{ data: Address[] }>("/addresses");
      setAddresses(res.data ?? []);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const load = async () => {
      setIsLoadingProvinces(true);
      try {
        setProvinces(await getProvinces());
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!wardLoadTrigger?.code) {
      setWards([]);
      return;
    }
    const { code, afterLoad } = wardLoadTrigger;
    const load = async () => {
      setIsLoadingWards(true);
      try {
        const loaded = await getWards(code);
        setWards(loaded);
        if (afterLoad) setWardCode(afterLoad);
      } finally {
        setIsLoadingWards(false);
      }
    };
    load();
  }, [wardLoadTrigger]);

  // ─── Phone: chỉ số, tối đa 10 ký tự ──────────────────────────────────────
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  // ─── Form handlers ─────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingAddress(null);
    setContactName("");
    setPhone("");
    setProvinceCode("");
    setWardCode("");
    setDetailAddress("");
    setType("HOME");
    setIsDefault(false);
    setWards([]);
    setWardLoadTrigger(null);
    setShowModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setContactName(addr.contactName);
    setPhone(addr.phone);
    setProvinceCode(addr.province.code);
    setWardCode("");
    setDetailAddress(addr.detailAddress);
    setType(addr.type);
    setIsDefault(addr.isDefault);
    setWards([]);
    setWardLoadTrigger({
      code: addr.province.code,
      afterLoad: addr.ward.code,
    });
    setShowModal(true);
  };

  const handleProvinceChange = (code: string) => {
    setProvinceCode(code);
    setWardCode("");
    setWards([]);
    setWardLoadTrigger(code ? { code } : null);
  };

  const handleSubmit = async () => {
    if (
      !contactName ||
      !phone ||
      !provinceCode ||
      !wardCode ||
      !detailAddress
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        contactName,
        phone,
        provinceCode,
        wardCode,
        detailAddress,
        type,
        isDefault,
      };
      if (editingAddress) {
        await apiRequest.patch(`/addresses/${editingAddress.id}`, payload);
      } else {
        await apiRequest.post("/addresses", payload);
      }
      setShowModal(false);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (addr: Address) => {
    setDeletingAddress(addr);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAddress) return;
    setIsDeleting(true);
    try {
      await apiRequest.delete(`/addresses/${deletingAddress.id}`);
      setShowDeleteModal(false);
      setDeletingAddress(null);
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiRequest.put(`/addresses/${id}/set-default`, {});
      await fetchAddresses();
    } catch (err: any) {
      alert(err?.message ?? "Có lỗi xảy ra");
    }
  };

  // ─── Form modal ────────────────────────────────────────────────────────────
  const formModalContent = (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-primary pr-8">
        {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          Thông tin người nhận
        </label>
        <input
          className={inputCls}
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Nhập họ và tên người nhận"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          Số điện thoại
        </label>
        <input
          className={inputCls}
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Nhập số điện thoại"
          inputMode="numeric"
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          Tỉnh/Thành phố
        </label>
        <SelectDown
          value={provinceCode}
          onChange={handleProvinceChange}
          disabled={isLoadingProvinces}
          placeholder={
            isLoadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"
          }
          options={provinces.map((p) => ({ value: p.code, label: p.fullName }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          Phường/Xã
        </label>
        <SelectDown
          value={wardCode}
          onChange={setWardCode}
          disabled={!provinceCode || isLoadingWards}
          placeholder={isLoadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
          options={wards.map((w) => ({ value: w.code, label: w.fullName }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1.5">
          Địa chỉ cụ thể
        </label>
        <input
          className={inputCls}
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          placeholder="Số nhà, tên đường..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          Loại địa chỉ
        </label>
        <div className="flex gap-2">
          {ADDRESS_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value as any)}
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                type === value
                  ? "border-accent bg-accent text-white"
                  : "border-neutral bg-neutral-light text-primary hover:border-accent"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-primary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4 accent-accent rounded cursor-pointer"
        />
        Đặt làm địa chỉ mặc định
      </label>

      <div className="flex gap-3 pt-1">
        <button
          onClick={() => setShowModal(false)}
          className="cursor-pointer flex-1 border border-neutral rounded-lg py-2.5 text-sm font-medium text-primary hover:bg-neutral transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="cursor-pointer flex-1 bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
      </div>
    </div>
  );

  // ─── Delete modal ──────────────────────────────────────────────────────────
  const deleteModalContent = (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-primary mb-1">
            Xác nhận xóa địa chỉ
          </h2>
          <p className="text-sm text-primary opacity-60">
            Bạn có chắc chắn muốn xóa địa chỉ này không?
            <br />
            Hành động này không thể hoàn tác.
          </p>
        </div>
      </div>

      {deletingAddress && (
        <div className="bg-neutral rounded-lg px-4 py-3 text-sm text-primary">
          <p className="font-medium mb-0.5">
            {deletingAddress.contactName} · {deletingAddress.phone}
          </p>
          <p className="opacity-60 text-xs leading-relaxed">
            {deletingAddress.fullAddress}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setDeletingAddress(null);
          }}
          className="cursor-pointer flex-1 border border-neutral rounded-lg py-2.5 text-sm font-medium text-primary hover:bg-neutral transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          className="cursor-pointer flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Đang xóa..." : "Xóa địa chỉ"}
        </button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-neutral-light-active rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
        <h1 className="text-base sm:text-xl font-semibold text-primary">
          Sổ địa chỉ nhận hàng
        </h1>
        {!isLoading && addresses.length > 0 && (
          <button
            onClick={openAddModal}
            className="cursor-pointer flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Thêm địa chỉ mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-neutral rounded-xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 bg-neutral-dark/20 rounded-full" />
                  <div className="h-5 w-24 bg-neutral-dark/20 rounded-full" />
                </div>
                <div className="h-4 w-48 bg-neutral-dark/20 rounded-md" />
                <div className="h-3.5 w-full bg-neutral-dark/20 rounded-md" />
                <div className="h-3.5 w-2/3 bg-neutral-dark/20 rounded-md" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="mb-5">
              <div className="relative inline-flex">
                <MapPin
                  size={56}
                  className="text-neutral-dark opacity-30"
                  strokeWidth={1.2}
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <Plus size={12} className="text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
            <p className="text-primary font-semibold text-base mb-1">
              Bạn chưa có lưu địa chỉ nào
            </p>
            <p className="text-sm text-primary opacity-60 mb-6">
              Cập nhật địa chỉ ngay để có trải nghiệm mua hàng
              <br className="hidden sm:block" /> nhanh nhất!
            </p>
            <button
              onClick={openAddModal}
              className="cursor-pointer bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cập nhật ngay
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const typeInfo = ADDRESS_TYPES.find((t) => t.value === addr.type);
              const TypeIcon = typeInfo?.icon ?? MapPin;
              return (
                <div
                  key={addr.id}
                  className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                    addr.isDefault
                      ? "border-accent bg-accent-light"
                      : "border-neutral bg-neutral-light"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-neutral text-primary px-2 py-0.5 rounded-full">
                        <TypeIcon size={11} />
                        {typeInfo?.label}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-white border border-accent px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(addr)}
                        className="cursor-pointer p-1.5 rounded-lg hover:bg-neutral text-primary opacity-60 hover:opacity-100 transition-all"
                        title="Sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => openDeleteModal(addr)}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-sm text-primary">
                      {addr.contactName}
                    </span>
                    <span className="text-neutral-dark text-xs">|</span>
                    <span className="text-sm text-primary opacity-70">
                      {addr.phone}
                    </span>
                  </div>

                  <p className="text-sm text-primary opacity-70 leading-relaxed mb-3">
                    {addr.fullAddress}
                  </p>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                      <CheckCircle size={13} />
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Popzy
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={formModalContent}
      />
      <Popzy
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingAddress(null);
        }}
        content={deleteModalContent}
      />
    </div>
  );
}