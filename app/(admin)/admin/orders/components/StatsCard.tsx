export function StatsCard({
   label,
   value,
   sub,
}: {
   label: string;
   value: string;
   sub: string;
}) {
   return (
      <div className="bg-neutral-light border border-neutral rounded-xl p-5 flex flex-col gap-2 hover:shadow-md transition-shadow duration-200">
         <span className="font-inters text-[11px] text-neutral-dark uppercase tracking-wider font-medium">
            {label}
         </span>
         <span className="font-inters text-[28px] font-bold text-primary leading-none">
            {value}
         </span>
         <span className="font-inters text-[11px] text-neutral-dark">
            {sub}
         </span>
      </div>
   );
}
