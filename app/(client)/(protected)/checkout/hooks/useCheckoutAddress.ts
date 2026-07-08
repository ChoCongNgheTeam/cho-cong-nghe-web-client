"use client";

import { useCallback, useEffect, useState } from "react";
import { getProvinces } from "@/(client)/(protected)/profile/_lib/get-provice";
import { getWards } from "@/(client)/(protected)/profile/_lib/get-wards";
import { logError } from "@/lib/monitoring/log-error";
import { getSavedAddresses, getDefaultAddress } from "../_lib/api";
import type { Province, Ward, SavedAddress } from "../_lib";

function splitDetailAddress(detail: string): { houseNumber: string; streetName: string } {
  const trimmed = detail.trim();
  const match = trimmed.match(/^(\S+)\s+(.+)$/);
  if (match) return { houseNumber: match[1], streetName: match[2] };
  return { houseNumber: "", streetName: trimmed };
}

interface UseCheckoutAddressArgs {
  authLoading: boolean;
  skipDefaultFetch: boolean;
}

export function useCheckoutAddress({ authLoading, skipDefaultFetch }: UseCheckoutAddressArgs) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [wantSaveAddress, setWantSaveAddress] = useState<boolean | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);
  const [mobileSelectedAddress, setMobileSelectedAddress] = useState<SavedAddress | null>(null);

  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const detailAddress = [houseNumber.trim(), streetName.trim()].filter(Boolean).join(" ");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Danh sách tỉnh/thành — load 1 lần
  useEffect(() => {
    const load = async () => {
      setIsLoadingProvinces(true);
      try {
        setProvinces(await getProvinces());
      } catch (err) {
        logError("useCheckoutAddress: getProvinces failed", err);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    load();
  }, []);

  // Danh sách phường/xã — reload mỗi khi đổi tỉnh/thành
  const [prevProvinceCode, setPrevProvinceCode] = useState(provinceCode);
  if (provinceCode !== prevProvinceCode) {
    setPrevProvinceCode(provinceCode);
    if (!provinceCode) setWards([]);
  }

  useEffect(() => {
    if (!provinceCode) return;
    const load = async () => {
      setIsLoadingWards(true);
      try {
        setWards(await getWards(provinceCode));
      } catch (err) {
        logError("useCheckoutAddress: getWards failed", err, { provinceCode });
      } finally {
        setIsLoadingWards(false);
      }
    };
    load();
  }, [provinceCode]);

  // Danh sách địa chỉ đã lưu — chọn địa chỉ mặc định (hoặc đầu tiên) làm giá trị khởi tạo form
  const fetchSavedAddresses = useCallback(async () => {
    if (hasFetchedAddresses) return;
    try {
      const list = await getSavedAddresses();
      setSavedAddresses(list);
      setHasFetchedAddresses(true);
      const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
      if (defaultAddr) {
        setSelectedSavedAddress(defaultAddr);
        setProvinceCode(defaultAddr.province.code);
        setWardCode(defaultAddr.ward.code);
        const { houseNumber: hn, streetName: sn } = splitDetailAddress(defaultAddr.detailAddress);
        setHouseNumber(hn);
        setStreetName(sn);
        setContactName(defaultAddr.contactName);
        setContactPhone(defaultAddr.phone);
      }
    } catch (err) {
      logError("useCheckoutAddress: fetch saved addresses failed", err);
      setSavedAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [hasFetchedAddresses]);

  useEffect(() => {
    // Fetch-on-mount hợp lệ (dữ liệu từ server, không thể tính trong render) —
    // rule set-state-in-effect false-positive với pattern này, xem facebook/react#34743.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSavedAddresses();
  }, [fetchSavedAddresses]);

  // Địa chỉ mặc định cho phần chọn nhanh trên mobile — bỏ qua nếu vừa quay lại từ
  // trang thêm địa chỉ mới (đã có luồng riêng set mobileSelectedAddress qua refreshAfterNewAddress)
  useEffect(() => {
    if (authLoading || skipDefaultFetch) return;
    const load = async () => {
      try {
        const addr = await getDefaultAddress();
        if (addr) {
          setMobileSelectedAddress(addr);
          return;
        }
      } catch (err) {
        logError("useCheckoutAddress: fetch default address failed", err);
      }
      try {
        const list = await getSavedAddresses();
        if (list.length > 0) setMobileSelectedAddress(list.find((a) => a.isDefault) ?? list[0]);
      } catch (err) {
        logError("useCheckoutAddress: fetch address list fallback failed", err);
      }
    };
    load();
  }, [authLoading, skipDefaultFetch]);

  // Gọi lại sau khi user quay về từ trang "thêm địa chỉ mới" (?newAddress=1) để đồng bộ
  // mobileSelectedAddress với địa chỉ vừa tạo
  const refreshAfterNewAddress = useCallback(async (targetId: string) => {
    try {
      const list = await getSavedAddresses();
      const target = list.find((a) => a.id === targetId) ?? list.find((a) => a.isDefault) ?? list[0];
      if (target) setMobileSelectedAddress(target);
    } catch (err) {
      logError("useCheckoutAddress: refresh after new address failed", err, { targetId });
    }
  }, []);

  const handleSelectSavedAddress = useCallback((addr: SavedAddress) => {
    setSelectedSavedAddress(addr);
    setProvinceCode(addr.province.code);
    setWardCode(addr.ward.code);
    const { houseNumber: hn, streetName: sn } = splitDetailAddress(addr.detailAddress);
    setHouseNumber(hn);
    setStreetName(sn);
    setContactName(addr.contactName);
    setContactPhone(addr.phone);
  }, []);

  const handleClearAddress = useCallback(() => {
    setSelectedSavedAddress(null);
    setProvinceCode("");
    setWardCode("");
    setHouseNumber("");
    setStreetName("");
    setWards([]);
    setContactName("");
    setContactPhone("");
    setWantSaveAddress(null);
  }, []);

  const handleProvinceChange = useCallback((code: string) => {
    setSelectedSavedAddress(null);
    setProvinceCode(code);
    setWardCode("");
    setWards([]);
  }, []);

  const handleWardChange = useCallback((val: string) => {
    setSelectedSavedAddress(null);
    setWardCode(val);
  }, []);

  const handleHouseNumberChange = useCallback((val: string) => {
    setSelectedSavedAddress(null);
    setHouseNumber(val);
  }, []);

  const handleStreetNameChange = useCallback((val: string) => {
    setSelectedSavedAddress(null);
    setStreetName(val);
  }, []);

  const handleShowManualForm = useCallback(() => {
    setShowManualForm(true);
    handleClearAddress();
  }, [handleClearAddress]);

  const handleBackToSaved = useCallback(() => {
    setShowManualForm(false);
    setWantSaveAddress(null);
    const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (defaultAddr) handleSelectSavedAddress(defaultAddr);
  }, [savedAddresses, handleSelectSavedAddress]);

  const activeAddressId = selectedSavedAddress?.id ?? mobileSelectedAddress?.id ?? null;

  return {
    // saved addresses
    savedAddresses,
    isLoadingAddresses,
    selectedSavedAddress,
    mobileSelectedAddress,
    setMobileSelectedAddress,
    activeAddressId,
    refreshAfterNewAddress,
    // manual form
    showManualForm,
    wantSaveAddress,
    setWantSaveAddress,
    contactName,
    contactPhone,
    provinceCode,
    wardCode,
    houseNumber,
    streetName,
    detailAddress,
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    // handlers
    onContactNameChange: setContactName,
    onContactPhoneChange: setContactPhone,
    onSelectSavedAddress: handleSelectSavedAddress,
    onShowManualForm: handleShowManualForm,
    onBackToSaved: handleBackToSaved,
    onProvinceChange: handleProvinceChange,
    onWardChange: handleWardChange,
    onHouseNumberChange: handleHouseNumberChange,
    onStreetNameChange: handleStreetNameChange,
  };
}
