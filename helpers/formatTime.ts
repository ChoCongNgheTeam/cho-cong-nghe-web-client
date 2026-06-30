import { getAdminLocale, getAdminTimeZone } from "./adminIntl";

export const formatTime = (
  date: string,
  options?: { locale?: string; timeZone?: string },
) => {
  const { locale, timeZone } = options || {};
  const resolvedLocale = locale ?? getAdminLocale();
  const resolvedTimeZone = timeZone ?? getAdminTimeZone();

  return new Intl.DateTimeFormat(resolvedLocale, {
    hour: "2-digit",
    minute: "2-digit",
    ...(resolvedTimeZone ? { timeZone: resolvedTimeZone } : {}),
  }).format(new Date(date));
};
