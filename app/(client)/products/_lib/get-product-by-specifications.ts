import apiRequest from "@/lib/api";
import { SpecificationsData } from "@/lib/types/product";

export async function getProductBySpecifications(
   slug: string,
): Promise<SpecificationsData> {
  const response = await apiRequest.get<{ data: SpecificationsData }>(
    `/products/slug/${slug}/specifications`,
    { noAuth: true }
  );
  return response.data;
}