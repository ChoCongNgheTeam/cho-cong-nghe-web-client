import { Province } from "../../checkout/types";

export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/v2/p/");
    if (!res.ok) return [];
    const data = await res.json();
    return (data ?? []).map((p: any) => ({
      code: String(p.code),
      name: p.name,
      fullName: p.nameWithType ?? p.name,
    }));
  } catch {
    return [];
  }
}