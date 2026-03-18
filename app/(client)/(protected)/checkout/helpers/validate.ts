const PHONE_REGEX = /^(0[3|5|7|8|9])\d{8}$/;

export function validatePhone(value: string): string | null {
   if (!value) return "Vui lòng nhập số điện thoại";
   if (!/^\d+$/.test(value)) return "Số điện thoại chỉ được chứa chữ số";
   if (value.length !== 10) return "Số điện thoại phải có đúng 10 chữ số";
   if (!PHONE_REGEX.test(value))
      return "Số điện thoại không hợp lệ (phải bắt đầu bằng 03, 05, 07, 08, 09)";
   return null;
}

export function validateName(value: string): string | null {
   if (!value.trim()) return "Vui lòng nhập họ tên";
   if (value.trim().length < 2) return "Họ tên phải có ít nhất 2 ký tự";
   return null;
}

export function validateAddress(value: string): string | null {
   if (!value.trim()) return "Vui lòng nhập địa chỉ chi tiết";
   if (value.trim().length < 5) return "Địa chỉ quá ngắn";
   return null;
}
