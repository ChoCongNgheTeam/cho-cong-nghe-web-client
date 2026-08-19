import { describe, it, expect, beforeEach, vi } from "vitest";
import { readLocalCart, writeLocalCart, clearLocalCart, buildSyncPayload, generateLocalId } from "../local-cart";
import type { CartItemWithDetails } from "../cart.types";

vi.mock("@/lib/monitoring/log-error", () => ({ logError: vi.fn() }));

const sampleItem: CartItemWithDetails = {
  id: "1",
  productVariantId: "pv1",
  quantity: 2,
  variantCode: "iphone-15-256GB-black",
  color: "black",
} as unknown as CartItemWithDetails;

describe("local-cart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when nothing is stored", () => {
    expect(readLocalCart()).toEqual([]);
  });

  it("writes and reads back items, deriving storageLabel from variantCode", () => {
    writeLocalCart([sampleItem]);
    const items = readLocalCart();
    expect(items).toHaveLength(1);
    expect(items[0].productVariantId).toBe("pv1");
    expect(items[0].storageLabel).toBe("256GB");
    expect(items[0].colorLabel).toBe("black");
    expect(typeof items[0].addedAt).toBe("number");
  });

  it("clears the cart", () => {
    writeLocalCart([sampleItem]);
    clearLocalCart();
    expect(readLocalCart()).toEqual([]);
  });

  it("recovers gracefully (returns []) when localStorage holds corrupted JSON", () => {
    localStorage.setItem("guest_cart", "{not-valid-json");
    expect(readLocalCart()).toEqual([]);
  });

  it("buildSyncPayload only keeps productVariantId + quantity", () => {
    const payload = buildSyncPayload([sampleItem]);
    expect(payload).toEqual([{ productVariantId: "pv1", quantity: 2 }]);
  });

  it("generateLocalId produces unique-looking ids prefixed with local_", () => {
    const a = generateLocalId();
    const b = generateLocalId();
    expect(a).toMatch(/^local_\d+_[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});
