import { CartItemWithDetails } from "@/(client)/cart/types/cart.types";

export function clampQty(desired: number, availableQty: number): number {
  const clamped = Math.max(1, desired);
  return availableQty > 0 ? Math.min(availableQty, clamped) : clamped;
}

export function validateQtyChange(current: number, delta: number, availableQty: number): string | null {
  const next = current + delta;
  if (next < 1) return "Số lượng tối thiểu là 1";
  if (availableQty > 0 && next > availableQty) return `Chỉ còn ${availableQty} sản phẩm trong kho`;
  return null;
}

export function transformApiItem(raw: CartItemWithDetails): CartItemWithDetails {
  const now = Date.now();
  const colorLabel = (raw as CartItemWithDetails & { color?: string }).colorLabel ?? (raw as CartItemWithDetails & { color?: string }).color ?? "";
  const storageLabel = raw.storageLabel ?? extractStorage((raw as CartItemWithDetails & { variantCode?: string }).variantCode ?? "");
  return {
    ...raw,
    colorLabel,
    storageLabel,
    color: colorLabel,
    unitPrice: (raw as CartItemWithDetails & { price?: { final?: number } }).price?.final ?? raw.unitPrice ?? 0,
    originalPrice: (raw as CartItemWithDetails & { price?: { base?: number } }).price?.base ?? raw.originalPrice ?? raw.unitPrice ?? 0,
    totalPrice: (raw as CartItemWithDetails & { totalFinalPrice?: number }).totalFinalPrice ?? raw.totalPrice ?? 0,
    selected: true,
    addedAt: raw.addedAt ?? now,
    createdAt: raw.createdAt ?? new Date(now).toISOString(),
    updatedAt: raw.updatedAt ?? new Date(now).toISOString(),
  };
}

function extractStorage(variantCode: string): string {
  const m = variantCode.match(/(\d+\s*(?:GB|TB))/i);
  return m ? m[1].replace(/\s+/g, "") : "";
}
