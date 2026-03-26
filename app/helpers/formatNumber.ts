import { getAdminLocale } from "./adminIntl";

export const formatNumber = (value: number, locale?: string) => {
  const resolvedLocale = locale ?? getAdminLocale();
  return new Intl.NumberFormat(resolvedLocale).format(value);
};
