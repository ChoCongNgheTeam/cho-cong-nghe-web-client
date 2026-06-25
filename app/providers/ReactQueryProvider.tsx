"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  console.log("[ReactQueryProvider] render");

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
