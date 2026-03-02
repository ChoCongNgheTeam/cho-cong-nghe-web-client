export const formatDate = (date: string, options?: { withTime?: boolean }) => {
   const { withTime = false } = options || {};

   return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      ...(withTime && {
         hour: "2-digit",
         minute: "2-digit",
      }),
   }).format(new Date(date));
};
