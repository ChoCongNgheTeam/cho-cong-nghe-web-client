const API_URL = "http://localhost:5000/api/v1/";

export async function getProvinces() {
   try {
      const res = await fetch(`${API_URL}addresses/locations/provinces`, {
         next: { revalidate: 60 },
      });

      if (!res.ok) {
         throw new Error(`HTTP error! status: ${res.status}`);
      }

      const response = await res.json();

      return response?.data || []; // tránh undefined
   } catch (error) {
      console.error("Error fetching provinces:", error);
      return [];
   }
}
