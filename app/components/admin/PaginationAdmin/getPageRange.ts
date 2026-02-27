export function getPageRange(
   current: number,
   total: number,
   siblings: number = 1,
): (number | "...")[] {
   const pages: (number | "...")[] = [];
   let prev: number | null = null;

   for (let i = 1; i <= total; i++) {
      const show =
         i === 1 ||
         i === total ||
         (i >= current - siblings && i <= current + siblings);

      if (show) {
         if (prev !== null && i - prev > 1) pages.push("...");
         pages.push(i);
         prev = i;
      }
   }

   return pages;
}
