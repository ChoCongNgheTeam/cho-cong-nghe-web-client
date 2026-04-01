/**
 * /flash-sale?date=YYYY-MM-DD
 * Server Component — fetch /home 1 lần, pass saleSchedule xuống client
 */

import { getHomePageData } from "../home/_libs";
import { FlashSaleClient } from "./FlashSaleClient";

interface Props {
   searchParams: Promise<{ date?: string }>;
}

export default async function FlashSalePage({ searchParams }: Props) {
   const { date } = await searchParams;
   const { saleSchedule } = await getHomePageData();

   return (
      <FlashSaleClient
         saleSchedule={saleSchedule ?? { schedule: [], todayProducts: null }}
         initialDate={date ?? null}
      />
   );
}
