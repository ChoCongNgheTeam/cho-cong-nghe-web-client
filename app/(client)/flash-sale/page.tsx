import { getHomePageData } from "../home/_libs";
import { FlashSaleClient } from "./FlashSaleClient";

export default async function FlashSalePage() {
   const { saleSchedule } = await getHomePageData();

   return (
      <FlashSaleClient
         saleSchedule={saleSchedule ?? { schedule: [], todayProducts: null }}
      />
   );
}
