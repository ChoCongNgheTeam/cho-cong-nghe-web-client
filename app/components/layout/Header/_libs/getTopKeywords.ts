import apiRequest from "@/lib/api";

export interface TrendingKeyword {
   id: string;
   name: string;
   slug: string;
   thumbnail: string;
   viewsCount: number;
   priceOrigin: number;
   isTrending: boolean;
}

interface TrendingResponse {
   data: TrendingKeyword[];
   total: number;
   message: string;
}

export async function fetchTrendingKeywords(): Promise<TrendingKeyword[]> {
   try {
      const res = await apiRequest.get<TrendingResponse>(
         "/products/search-trending",
         { noAuth: true },
      );
      return res?.data ?? [];
   } catch {
      return [];
   }
}
