import { Suspense } from "react";
import { getHomePageData } from "../home/_lib/home";
import { FlashSaleClient } from "./FlashSaleClient";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function FlashSalePage() {
  const { saleSchedule } = await getHomePageData();

  return (
    <Suspense fallback={null}>
      <FlashSaleClient saleSchedule={saleSchedule ?? { schedule: [], todayProducts: null }} />
      <MobileBottomNav />
    </Suspense>
  );
}
