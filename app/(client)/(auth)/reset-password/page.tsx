import { Suspense } from "react";
import ResetPasswordContent from "./resetPasswordContent";

export default function ResetPasswordPage() {
   return (
      <Suspense
         fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-light">
               <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
            </div>
         }
      >
         <ResetPasswordContent />
      </Suspense>
   );
}
