import { getAdminLocale } from "./localeSettings";

export const formatNumber = (value: number, locale?: string) => {
  const resolvedLocale = locale ?? getAdminLocale();
  return new Intl.NumberFormat(resolvedLocale).format(value);
};
