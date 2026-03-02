export function TableSkeleton() {
   return (
      <>
         {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b border-neutral">
               {Array.from({ length: 10 }).map((__, j) => (
                  <td key={j} className="px-4 py-3.5">
                     <div
                        className="h-4 bg-neutral-light-active rounded-full animate-pulse"
                        style={{
                           width: `${50 + Math.random() * 40}%`,
                           animationDelay: `${i * 50}ms`,
                        }}
                     />
                  </td>
               ))}
            </tr>
         ))}
      </>
   );
}
