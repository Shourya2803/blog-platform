// src/server/trpc/routers/category.ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/slugify";

export const categoryRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.name);
      const [created] = await ctx.db
        .insert(categories)
        .values({ name: input.name, description: input.description ?? "", slug })
        .returning();
      return created;
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(categories).orderBy(categories.name);
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.name);
      await ctx.db
        .update(categories)
        .set({ name: input.name, description: input.description ?? "", slug })
        .where(eq(categories.id, input.id));
      const [row] = await ctx.db.select().from(categories).where(eq(categories.id, input.id));
      return row;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // If you want cascade, consider deleting postCategories rows first (or add ON DELETE CASCADE)
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
