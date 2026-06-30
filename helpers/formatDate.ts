import { getAdminLocale, getAdminTimeZone } from "./adminIntl";

export const formatDate = (
   date: string | undefined | null,
   options?: { withTime?: boolean; locale?: string; timeZone?: string },
) => {
   if (!date) return "—";
   const { withTime = false, locale, timeZone } = options || {};
   const resolvedLocale = locale ?? getAdminLocale();
   const resolvedTimeZone = timeZone ?? getAdminTimeZone();

   return new Intl.DateTimeFormat(resolvedLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(withTime && {
         hour: "2-digit",
         minute: "2-digit",
      }),
      ...(resolvedTimeZone ? { timeZone: resolvedTimeZone } : {}),
   }).format(new Date(date));
};
