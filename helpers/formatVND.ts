import { getAdminLocale } from "./adminIntl";

export function formatVND(amount: string | number, locale?: string) {
   const resolvedLocale = locale ?? getAdminLocale();
   return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
   }).format(Number(amount));
}
