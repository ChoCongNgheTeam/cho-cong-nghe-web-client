import type { CartItemWithDetails } from "@/(client)/cart/_lib/cart.types";

export interface Province {
  code: string;
  name: string;
  fullName: string;
}

export interface Ward {
  code: string;
  name: string;
  fullName: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
}

export interface SavedAddress {
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

// Shape hiển thị tối giản cho CartItems.tsx — map trực tiếp từ CartItemWithDetails,
// không còn field snake_case (trước đây unit_price/original_price chỉ tồn tại để
// "phòng hờ" 1 API cũ không còn dùng — dữ liệu thật từ cart luôn là camelCase)
export interface CartItem {
  id: string;
  name: string;
  variant: string;
  color?: string;
  colorValue?: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  image?: string;
}

export interface CheckoutData {
  selectedItems: CartItemWithDetails[];
  cartItemIds?: string[];
  appliedVoucherCode: string;
  appliedVoucherValue: number;
  appliedVoucherId?: string;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  rewardPoints: number;
  usePoints: boolean;
  newAddressId?: string;
}

export interface PreviewData {
  subtotalAmount: number;
  shippingFee: number;
  totalPromotionDiscount: number;
  voucherDiscount: number;
  totalAmount: number;
}

export interface ShippingSectionProps {
  isLoadingAddresses: boolean;
  savedAddresses: SavedAddress[];
  showManualForm: boolean;
  selectedSavedAddress: SavedAddress | null;
  contactName: string;
  contactPhone: string;
  provinceCode: string;
  wardCode: string;
  provinces: Province[];
  wards: Ward[];
  isLoadingProvinces: boolean;
  isLoadingWards: boolean;
  wantSaveAddress: boolean | null;
  instanceId?: string;
  onSelectSavedAddress: (addr: SavedAddress) => void;
  onShowManualForm: () => void;
  onBackToSaved: () => void;
  onContactNameChange: (v: string) => void;
  onContactPhoneChange: (v: string) => void;
  onProvinceChange: (v: string) => void;
  onWardChange: (v: string) => void;
  onWantSaveAddressChange: (v: boolean) => void;
  onEditAddress: () => void;
  houseNumber: string;
  streetName: string;
  onHouseNumberChange: (v: string) => void;
  onStreetNameChange: (v: string) => void;
}
