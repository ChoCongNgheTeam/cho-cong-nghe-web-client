import { Suspense } from "react";
import AuthPage from "./AuthPage";

export default function AccountPage() {
   return (
      <Suspense fallback={null}>
         <AuthPage />
      </Suspense>
   );
}
