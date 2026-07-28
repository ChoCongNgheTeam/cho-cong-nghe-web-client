export type DiscountType = "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";

export interface SpinPrizeVoucherLite {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

export interface SpinPrize {
  id: string;
  label: string;
  colorHex: string | null;
  voucherId: string | null;
  weight: number;
  totalBudget: number | null;
  awardedCount: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  voucher: SpinPrizeVoucherLite | null;
}

export interface CreateSpinPrizePayload {
  label: string;
  colorHex?: string;
  voucherId?: string;
  weight?: number;
  totalBudget?: number;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSpinPrizePayload {
  label?: string;
  colorHex?: string;
  voucherId?: string | null;
  weight?: number;
  totalBudget?: number | null;
  order?: number;
  isActive?: boolean;
}

export interface SpinPrizeStat {
  id: string;
  label: string;
  colorHex: string | null;
  totalBudget: number | null;
  awardedCount: number;
  voucherId: string | null;
  _count: { entries: number };
}

export interface SpinStats {
  totalSpins: number;
  byPrize: SpinPrizeStat[];
}
