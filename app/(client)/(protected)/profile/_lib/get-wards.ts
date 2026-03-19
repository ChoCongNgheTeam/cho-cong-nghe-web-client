import apiRequest from "@/lib/api";

export async function getWards(provinceId: string) {
  try {
    const response = await apiRequest.get<{ data: any[] }>(
      `/addresses/locations/${provinceId}/wards`,
      { noAuth: true },
    );
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
}
