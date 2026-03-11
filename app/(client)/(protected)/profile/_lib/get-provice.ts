import apiRequest from "@/lib/api";

export async function getProvinces() {
  try {
    const response = await apiRequest.get<{ data: any[] }>(
      `/addresses/locations/provinces`,
      { noAuth: true }
    );
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
}