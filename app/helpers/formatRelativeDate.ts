export const formatRelativeDate = (dateStr: string): string => {
   const now = new Date();
   const date = new Date(dateStr); // ISO 8601 parse tự động về UTC rồi convert local
   const diffMs = now.getTime() - date.getTime();

   // Nếu diff âm (clock skew) → hiển thị "Vừa xong"
   if (diffMs < 0) return "Vừa xong";

   const diffSecs = Math.floor(diffMs / 1000);
   const diffMins = Math.floor(diffSecs / 60);
   const diffHours = Math.floor(diffMins / 60);
   const diffDays = Math.floor(diffHours / 24);
   const diffWeeks = Math.floor(diffDays / 7);
   const diffMonths = Math.floor(diffDays / 30);
   const diffYears = Math.floor(diffDays / 365);

   if (diffSecs < 60) return "Vừa xong";
   if (diffMins < 60) return `${diffMins} phút trước`;
   if (diffHours < 24) return `${diffHours} giờ trước`;
   if (diffDays < 7) return `${diffDays} ngày trước`;
   if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
   if (diffMonths < 12) return `${diffMonths} tháng trước`;
   return `${diffYears} năm trước`;
};
