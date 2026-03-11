import { CartItemWithDetails } from "../types/cart.types";

const LOCAL_KEY = "guest_cart";

function extractStorage(variantCode: string): string {
   const m = variantCode.match(/(\d+\s*(?:GB|TB))/i);
   return m ? m[1].replace(/\s+/g, "") : "";
}

export function readLocalCart(): CartItemWithDetails[] {
   if (typeof window === "undefined") return [];
   try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
      return raw.map(
         (
            item: CartItemWithDetails & {
               color?: string;
               variantCode?: string;
            },
         ) => ({
            ...item,
            colorLabel: item.colorLabel ?? item.color ?? "",
            storageLabel:
               item.storageLabel ?? extractStorage(item.variantCode ?? ""),
            addedAt: item.addedAt ?? Date.now(),
         }),
      );
   } catch {
      return [];
   }
}

export function writeLocalCart(items: CartItemWithDetails[]): void {
   if (typeof window === "undefined") return;
   localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export function clearLocalCart(): void {
   if (typeof window === "undefined") return;
   localStorage.removeItem(LOCAL_KEY);
}

export interface SyncCartPayload {
   productVariantId: string;
   quantity: number;
}

export function buildSyncPayload(
   items: CartItemWithDetails[],
): SyncCartPayload[] {
   return items.map((i) => ({
      productVariantId: i.productVariantId,
      quantity: i.quantity,
   }));
}

export function generateLocalId(): string {
   return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
