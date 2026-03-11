"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiAddress {
  id: string;
  contactName: string;
  phone: string;
  detailAddress: string;
  fullAddress?: string;
  ward?: { id: string; name: string; fullName?: string };
  province?: { id: string; name: string; fullName?: string };
  isDefault: boolean;
  type?: string;
  createdAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AddressSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddressId: string | undefined;
  onSelect: (address: ApiAddress) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddressSidebar({
  isOpen,
  onClose,
  selectedAddressId,
  onSelect,
}: AddressSidebarProps) {
  const toast = useToasty();
  const router = useRouter();
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(selectedAddressId);

  useEffect(() => {
    setSelected(selectedAddressId);
  }, [selectedAddressId]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      return;
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get<ApiResponse<ApiAddress[]>>("/addresses");
        const list = res?.data ?? [];
        setAddresses(list);
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) ?? list[0];
          setSelected((prev) => prev ?? def.id);
          if (!selectedAddressId) onSelect(def);
        }
      } catch {
        toast.error("Không thể tải danh sách địa chỉ");
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    const addr = addresses.find((a) => a.id === selected);
    if (!addr) { toast.error("Vui lòng chọn địa chỉ giao hàng"); return; }
    onSelect(addr);
    onClose();
  };

  const handleGoToAddAddress = () => {
    onClose();
    router.push("/profile/addresses?redirect=checkout");
  };

  const formatAddress = (addr: ApiAddress) =>
    addr.fullAddress ??
    [addr.detailAddress, addr.ward?.name, addr.province?.name].filter(Boolean).join(", ");

  const formatType = (type?: string) => {
    if (!type) return null;
    const map: Record<string, string> = { HOME: "Nhà riêng", OFFICE: "Văn phòng", OTHER: "Khác" };
    return map[type.toUpperCase()] ?? type;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-all cursor-pointer backdrop-blur-sm bg-neutral-light/70"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[520px] bg-neutral-light shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-primary">Chọn địa chỉ nhận hàng</h2>
          <button
            onClick={onClose}
            className="text-neutral-dark hover:text-neutral-darker w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-neutral-darker">Đang tải địa chỉ...</p>
            </div>
          )}

          {/* No addresses */}
          {!loading && addresses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral flex items-center justify-center">
                <MapPin className="w-8 h-8 text-neutral-darker" />
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">Chưa có địa chỉ nào</p>
                <p className="text-sm text-neutral-darker mb-4">Thêm địa chỉ để tiến hành đặt hàng</p>
              </div>
              <button
                onClick={handleGoToAddAddress}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-neutral-light text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Thêm địa chỉ mới
              </button>
            </div>
          )}

          {/* Address list */}
          {!loading && addresses.length > 0 && (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-light border border-accent/30">
                <AlertCircle size={15} className="text-accent-dark shrink-0 mt-0.5" />
                <p className="text-xs text-accent-dark leading-relaxed">
                  Chọn địa chỉ giao hàng hoặc{" "}
                  <button
                    onClick={handleGoToAddAddress}
                    className="font-semibold underline underline-offset-2 hover:opacity-80 cursor-pointer"
                  >
                    thêm địa chỉ mới
                  </button>
                </p>
              </div>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelected(addr.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selected === addr.id
                      ? "border-accent bg-accent-light shadow-sm"
                      : "border-neutral hover:border-neutral-darker hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        selected === addr.id ? "border-accent bg-accent" : "border-neutral-dark"
                      }`}
                    >
                      {selected === addr.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-darker" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-primary">{addr.contactName}</span>
                        <span className="text-neutral-darker text-sm">{addr.phone}</span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent text-primary-darker font-medium">
                            <CheckCircle2 size={11} />
                            Mặc định
                          </span>
                        )}
                      </div>
                      {addr.type && (
                        <p className="text-xs text-neutral-darker mb-1">{formatType(addr.type)}</p>
                      )}
                      <p className="text-sm text-primary leading-relaxed">{formatAddress(addr)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral shrink-0 space-y-2">
          {addresses.length > 0 && (
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="w-full py-3 rounded-lg font-medium text-sm transition-all cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary-hover text-neutral-light"
            >
              Xác nhận địa chỉ
            </button>
          )}
          <button
            onClick={handleGoToAddAddress}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-sm border-2 border-neutral-dark hover:border-primary hover:bg-neutral transition-colors text-primary cursor-pointer"
          >
            <Plus size={15} />
            Thêm địa chỉ mới
          </button>
        </div>
      </div>
    </>
  );
}