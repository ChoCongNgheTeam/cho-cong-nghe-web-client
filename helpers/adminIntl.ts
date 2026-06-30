export const DEFAULT_ADMIN_LOCALE = "vi-VN";
export const DEFAULT_ADMIN_TIMEZONE = "Asia/Ho_Chi_Minh";

export const getAdminLocale = () => {
  if (typeof document !== "undefined") {
    const domLocale =
      document.documentElement.dataset.locale ||
      document.documentElement.dataset.adminLocale;
    if (domLocale) return domLocale;
    try {
      return (
        localStorage.getItem("app.locale") ||
        localStorage.getItem("admin.locale") ||
        DEFAULT_ADMIN_LOCALE
      );
    } catch {
      return DEFAULT_ADMIN_LOCALE;
    }
  }
  return DEFAULT_ADMIN_LOCALE;
};

export const getAdminTimeZone = () => {
  if (typeof document !== "undefined") {
    const domZone =
      document.documentElement.dataset.timezone ||
      document.documentElement.dataset.adminTimezone;
    if (domZone) return domZone;
    try {
      return (
        localStorage.getItem("app.timeZone") ||
        localStorage.getItem("admin.timeZone") ||
        undefined
      );
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const getAdminTimeZoneOrDefault = (
  fallback = DEFAULT_ADMIN_TIMEZONE,
) => {
  return getAdminTimeZone() ?? fallback;
};
