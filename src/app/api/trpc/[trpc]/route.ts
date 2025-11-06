// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/rootRouter";
import { createContext } from "@/server/trpc/context";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error("tRPC error:", error);
    },
  });
};

export { handler as GET, handler as POST };
