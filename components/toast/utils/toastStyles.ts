import type { ToastType } from "../types";

const BASE_STYLES = "relative flex flex-col min-w-[320px] max-w-md rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-300 overflow-hidden";

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-white border border-green-200",
  error: "bg-white border border-red-200",
  warning: "bg-white border border-yellow-200",
  info: "bg-white border border-blue-200",
  loading: "bg-white border border-gray-200",
};

const ICON_CONTAINER_STYLES: Record<ToastType, string> = {
  success: "bg-green-100 text-green-600",
  error: "bg-red-100 text-red-600",
  warning: "bg-yellow-100 text-yellow-600",
  info: "bg-blue-100 text-blue-600",
  loading: "bg-gray-100 text-gray-600",
};

const PROGRESS_BAR_COLORS: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  loading: "bg-gray-500",
};

const BUTTON_VARIANT_STYLES = {
  primary: "bg-gray-900 text-white hover:bg-gray-800",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  ghost: "text-gray-700 hover:bg-gray-100",
} as const;

interface GetToastClassNameParams {
  type: ToastType;
  isVisible: boolean;
  isLeaving: boolean;
  clickable: boolean;
}

export function getToastClassName({ type, isVisible, isLeaving, clickable }: GetToastClassNameParams): string {
  const animationStyles = isLeaving ? "opacity-0 translate-y-2 scale-95" : isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95";
  const clickableStyles = clickable ? "cursor-pointer hover:shadow-xl" : "";
  return `${BASE_STYLES} ${TYPE_STYLES[type]} ${animationStyles} ${clickableStyles}`;
}

export function getIconContainerStyle(type: ToastType): string {
  return ICON_CONTAINER_STYLES[type];
}

export function getProgressBarColor(type: ToastType): string {
  return PROGRESS_BAR_COLORS[type];
}

export function getButtonVariantStyle(variant: keyof typeof BUTTON_VARIANT_STYLES = "primary"): string {
  return BUTTON_VARIANT_STYLES[variant];
}
