import { Ward } from "../../checkout/types";

export async function getWards(provinceCode: string): Promise<Ward[]> {
  try {
    const res = await fetch(
      `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.wards ?? []).map((w: any) => ({
      code: String(w.code),
      name: w.name,
      fullName: w.nameWithType ?? w.name,
    }));
  } catch {
    return [];
  }
}