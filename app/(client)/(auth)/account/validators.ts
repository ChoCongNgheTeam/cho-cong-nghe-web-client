export const VALIDATION_MESSAGES = {
  userName: {
    required: "Vui lòng nhập tên đăng nhập",
    minLength: "Tên đăng nhập phải có ít nhất 3 ký tự",
    invalid: "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới",
  },
  password: {
    required: "Vui lòng nhập mật khẩu",
    minLength: "Mật khẩu phải có ít nhất 6 ký tự",
    uppercase: "Mật khẩu phải có ít nhất 1 chữ hoa",
    digit: "Mật khẩu phải có ít nhất 1 số",
    invalid: "Mật khẩu không được chứa ký tự có dấu hoặc ký tự đặc biệt không hợp lệ",
  },
  confirmPassword: {
    required: "Vui lòng nhập lại mật khẩu",
    mismatch: "Mật khẩu không khớp",
  },
  email: {
    required: "Email là bắt buộc",
    invalid: "Email không hợp lệ",
  },
  phone: {
    incomplete: "Số điện thoại chưa đủ số",
    invalid: "Số điện thoại không hợp lệ (VD: 0999999999)",
  },
  terms: {
    required: "Bạn phải đồng ý với điều khoản",
  },
} as const;

const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const PASSWORD_REGEX = /^[A-Za-z\d@$!%*?&]+$/;
const PASSWORD_UPPERCASE_REGEX = /(?=.*[A-Z])/;
const PASSWORD_DIGIT_REGEX = /(?=.*\d)/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

export function validateUserName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return VALIDATION_MESSAGES.userName.required;
  if (trimmed.length < 3) return VALIDATION_MESSAGES.userName.minLength;
  if (!USERNAME_REGEX.test(trimmed)) return VALIDATION_MESSAGES.userName.invalid;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return VALIDATION_MESSAGES.password.required;
  if (value.length < 6) return VALIDATION_MESSAGES.password.minLength;
  if (!PASSWORD_REGEX.test(value)) return VALIDATION_MESSAGES.password.invalid;
  if (!PASSWORD_UPPERCASE_REGEX.test(value)) return VALIDATION_MESSAGES.password.uppercase;
  if (!PASSWORD_DIGIT_REGEX.test(value)) return VALIDATION_MESSAGES.password.digit;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return VALIDATION_MESSAGES.confirmPassword.required;
  if (password !== confirmPassword) return VALIDATION_MESSAGES.confirmPassword.mismatch;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return VALIDATION_MESSAGES.email.required;
  if (!EMAIL_REGEX.test(trimmed)) return VALIDATION_MESSAGES.email.invalid;
}

export function validatePhone(value: string): string | undefined {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return;
  const normalized = trimmed.startsWith("+84") ? "0" + trimmed.slice(3) : trimmed;
  if (normalized.length < 10) return VALIDATION_MESSAGES.phone.incomplete;
  if (!PHONE_REGEX.test(trimmed)) return VALIDATION_MESSAGES.phone.invalid;
}
