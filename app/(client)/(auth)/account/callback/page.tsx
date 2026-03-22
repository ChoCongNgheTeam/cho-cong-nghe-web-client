// app/(client)/(auth)/account/callback/page.tsx

import { Suspense } from "react";
import AuthCallbackPage from "./AuthCallbackPage"; // đổi tên file hiện tại

export default function CallbackPage() {
   return (
      <Suspense fallback={null}>
         <AuthCallbackPage />
      </Suspense>
   );
}
