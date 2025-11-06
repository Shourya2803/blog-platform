import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";

// Provide the application Context type so `ctx` is properly typed in procedures
const t = initTRPC.context<Context>().create({});
export const router = t.router;
export const publicProcedure = t.procedure;
