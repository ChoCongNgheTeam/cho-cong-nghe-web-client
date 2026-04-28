"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { PasswordRequirement } from "./PasswordRequirement";
import { changeMyPassword } from "../_lib/settings";

export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToasty();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string) => ({
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordStrength = validatePassword(formData.newPassword);
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const getStrengthColor = () => {
    if (strengthScore <= 2) return "bg-promotion";
    if (strengthScore <= 4) return "bg-accent";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strengthScore <= 2) return "Yếu";
    if (strengthScore <= 3) return "Trung bình";
    if (strengthScore <= 4) return "Khá";
    return "Mạnh";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await changeMyPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      toast.success("Mật khẩu đã được thay đổi thành công!", { title: "Thành công" });
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => router.push("/profile"), 2000);
    } catch (error) {
      const errorMessage = (error as { data?: { message?: string }; message?: string })?.data?.message || (error as { message?: string })?.message || "Không thể đổi mật khẩu. Vui lòng thử lại.";
      toast.error(errorMessage, { title: "Lỗi" });
      if (errorMessage.toLowerCase().includes("mật khẩu hiện tại") || errorMessage.toLowerCase().includes("không đúng")) {
        setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field: "current" | "new" | "confirm") => setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const inputBase =
    "w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-11 border rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm sm:text-base";

  const PasswordField = ({
    id,
    label,
    field,
    value,
    show,
    error,
    placeholder,
  }: {
    id: string;
    label: string;
    field: "current" | "new" | "confirm";
    value: string;
    show: boolean;
    error?: string;
    placeholder: string;
  }) => (
    <div>
      <label htmlFor={id} className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${inputBase} ${error ? "border-promotion" : "border-neutral"}`}
        />
        <button type="button" onClick={() => toggleShowPassword(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors">
          {show ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs sm:text-sm text-promotion">{error}</p>}
    </div>
  );

  return (
    <div className="bg-neutral-light">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-accent-light rounded-lg shrink-0">
              <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-primary">Đổi mật khẩu</h1>
              <p className="text-xs sm:text-sm text-primary mt-0.5 sm:mt-1">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-neutral-light border border-neutral rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <PasswordField
              id="currentPassword"
              label="Mật khẩu hiện tại"
              field="current"
              value={formData.currentPassword}
              show={showPassword.current}
              error={errors.currentPassword}
              placeholder="Nhập mật khẩu hiện tại"
            />

            <div className="border-t border-neutral" />

            <div>
              <PasswordField id="newPassword" label="Mật khẩu mới" field="new" value={formData.newPassword} show={showPassword.new} error={errors.newPassword} placeholder="Nhập mật khẩu mới" />

              {formData.newPassword && (
                <div className="mt-2 sm:mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-primary-light">Độ mạnh mật khẩu</span>
                    <span className={`text-xs font-medium ${strengthScore <= 2 ? "text-promotion" : strengthScore <= 4 ? "text-accent" : "text-green-500"}`}>{getStrengthText()}</span>
                  </div>
                  <div className="flex gap-1 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strengthScore ? getStrengthColor() : "bg-neutral"}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-1.5">
                    <PasswordRequirement met={passwordStrength.length} text="Ít nhất 6 ký tự" />
                    <PasswordRequirement met={passwordStrength.uppercase} text="Chứa chữ hoa (A-Z)" />
                    <PasswordRequirement met={passwordStrength.lowercase} text="Chứa chữ thường (a-z)" />
                    <PasswordRequirement met={passwordStrength.number} text="Chứa số (0-9)" />
                    <PasswordRequirement met={passwordStrength.special} text="Ký tự đặc biệt (!@#$...)" />
                  </div>
                </div>
              )}
            </div>

            <PasswordField
              id="confirmPassword"
              label="Xác nhận mật khẩu mới"
              field="confirm"
              value={formData.confirmPassword}
              show={showPassword.confirm}
              error={errors.confirmPassword}
              placeholder="Nhập lại mật khẩu mới"
            />

            <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-accent-light border border-accent-light-active rounded-lg">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-primary mb-1">Lưu ý bảo mật</p>
                <ul className="space-y-0.5 sm:space-y-1 text-xs text-primary">
                  <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                  <li>• Sử dụng mật khẩu khác nhau cho mỗi tài khoản</li>
                  <li>• Thay đổi mật khẩu định kỳ để bảo mật tốt hơn</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-neutral text-primary rounded-lg text-sm sm:text-base font-medium hover:bg-neutral-light-hover transition-colors duration-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-neutral-light rounded-lg text-sm sm:text-base font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
