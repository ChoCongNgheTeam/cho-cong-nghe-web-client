import { useCallback, useRef } from "react";

export default function useDebouncedCallback<
   T extends (...args: any[]) => Promise<any>,
>(fn: T, delay = 350): T {
   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const fnRef = useRef(fn);
   fnRef.current = fn;

   return useCallback(
      (...args: Parameters<T>) =>
         new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
               fnRef
                  .current(...args)
                  .then(resolve)
                  .catch(reject);
            }, delay);
         }) as Promise<Awaited<ReturnType<T>>>,
      [delay],
   ) as T;
}
