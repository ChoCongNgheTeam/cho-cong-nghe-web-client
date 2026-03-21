import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SaleScheduleRule {
  actionType: string;
  discountValue: number | null;
}

export interface SaleSchedulePromotion {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  targetsCount: number;
  rules: SaleScheduleRule[];
}

export interface SaleScheduleDay {
  date: string; // "2026-03-18"
  isToday: boolean;
  hasActiveSale: boolean;
  promotions: SaleSchedulePromotion[];
}

export interface SaleProduct {
  card: any;
  pricingContext: any;
}

export interface SaleScheduleData {
  schedule: SaleScheduleDay[];
  todayProducts: {
    products: SaleProduct[];
    total: number;
    date: string;
    startDate: string | null;
    endDate: string | null;
    promotions: Array<{ id: string; name: string; description: string | null; priority: number }>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────

export async function getSaleSchedule(): Promise<SaleScheduleData> {
  try {
    const response = await apiRequest.get<HomeApiResponse>("/home", {
      noAuth: true,
    });
    return response.data.saleSchedule;
  } catch (error) {
    console.error("Failed to fetch sale schedule:", error);
    return {
      schedule: [],
      todayProducts: {
        products: [],
        total: 0,
        date: "",
        startDate: null,
        endDate: null,
        promotions: [],
      },
    };
  }
}
