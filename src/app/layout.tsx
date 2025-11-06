// src/app/layout.tsx
"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, createClient } from "@/utils/trpc";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [trpcClient] = useState(() => createClient());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}
