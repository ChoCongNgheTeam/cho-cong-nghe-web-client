export function PasswordRequirement({
   met,
   text,
}: {
   met: boolean;
   text: string;
}) {
   return (
      <div className="flex items-center gap-2">
         <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
               met ? "bg-green-500" : "bg-neutral"
            }`}
         >
            {met && (
               <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={3}
                     d="M5 13l4 4L19 7"
                  />
               </svg>
            )}
         </div>
         <span
            className={`text-xs transition-colors ${
               met ? "text-primary" : "text-primary-light"
            }`}
         >
            {text}
         </span>
      </div>
   );
}
