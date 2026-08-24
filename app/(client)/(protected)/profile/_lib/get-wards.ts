import { Ward } from "../../checkout/_lib";

export async function getWards(provinceCode: string): Promise<Ward[]> {
  // Chặn NGAY tại đây thay vì chỉ dựa vào guard ở nơi gọi — đã thấy lỗi thật
  // (CORS/404 trên .../p/?depth=2, tức provinceCode rỗng lọt tới đây) dù
  // useCheckoutAddress.ts đã có `if (!provinceCode) return` trước khi gọi. Có
  // nhiều đường có thể khiến provinceCode rỗng/whitespace lọt qua (dữ liệu địa
  // chỉ đã lưu thiếu province.code, race condition lúc đổi tỉnh nhanh...) — thay
  // vì rượt theo từng nguyên nhân, chặn cứng ở tầng thấp nhất đảm bảo KHÔNG BAO
  // GIỜ gọi API với code rỗng, bất kể lỗi phát sinh từ đâu phía trên.
  if (!provinceCode?.trim()) return [];

  try {
    const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
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
