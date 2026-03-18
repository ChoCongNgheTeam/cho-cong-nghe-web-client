export interface Province {
   id: string;
   name: string;
   fullName: string;
}

export interface Ward {
   id: string;
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
   province: { id: string; name: string; fullName: string };
   ward: { id: string; name: string; fullName: string };
   detailAddress: string;
   fullAddress: string;
   type: "HOME" | "OFFICE" | "OTHER";
   isDefault: boolean;
}

export interface CartItem {
   id: string;
   name: string;
   variant: string;
   color?: string;
   colorValue?: string;
   quantity: number;
   unit_price: number;
   original_price?: number;
   image?: string;
}

export interface SelectedItem {
   id: string;
   productName?: string;
   product_name?: string;
   variantCode?: string;
   variant_name?: string;
   quantity: number;
   unitPrice?: number;
   unit_price?: number;
   originalPrice?: number;
   original_price?: number;
   image?: string;
   image_url?: string;
   color?: string;
   colorValue?: string;
}

export interface CheckoutData {
   selectedItems: SelectedItem[];
   selectedPromotions: string[];
   promotionValue: number;
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
   voucherDiscount: number;
   taxAmount: number;
   totalAmount: number;
}

export interface ShippingSectionProps {
   isLoadingAddresses: boolean;
   savedAddresses: SavedAddress[];
   showManualForm: boolean;
   selectedSavedAddress: SavedAddress | null;
   contactName: string;
   contactPhone: string;
   provinceId: string;
   wardId: string;
   detailAddress: string;
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
   onDetailAddressChange: (v: string) => void;
   onWantSaveAddressChange: (v: boolean) => void;
   onEditAddress: () => void;
}
