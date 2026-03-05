const API_URL = "http://localhost:5001/api/v1/";

export async function getWards(provinceId: string) {
  try {
    const res = await fetch(
      `${API_URL}addresses/locations/${provinceId}/wards`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch wards");
    }

    const response = await res.json();
    return response?.data || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    return [];
  }
}
