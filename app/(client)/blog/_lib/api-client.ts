export const API_BASE_URL = "http://localhost:5000/api/v1";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // ⚠️ QUAN TRỌNG: tránh lỗi fetch runtime
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}`);
  }

  return res.json();
}
