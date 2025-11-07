// src/server/trpc/routers/post.ts
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { posts, post_categories, categories } from "../../db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "../../../lib/slugify";
import { uploadImageToCloudinary } from "../../utils/cloudinary";


// input schemas (accept the shape coming from the client)
const createPostSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  categoryIds: z.array(z.number()).optional(),
  image_url: z.string().url().optional().or(z.literal("")).optional(),
  published: z.boolean().optional(),
});

const updatePostSchema = createPostSchema.extend({
  id: z.number(),
});

export const postRouter = router({
  create: publicProcedure.input(createPostSchema).mutation(async ({ input, ctx }) => {
    const slug = slugify(input.title);
    const [created] = await ctx.db
      .insert(posts)
      .values({
        title: input.title,
        slug,
        content: input.content,
        published: input.published ?? false,
        image_url: input.image_url ?? "",
      })
      .returning();

    if (input.categoryIds && input.categoryIds.length) {
      await Promise.all(
        input.categoryIds.map((cid) =>
          ctx.db.insert(post_categories).values({ post_id: created.id, category_id: cid })
        )
      );
    }

    return created;
  }),

  getAll: publicProcedure
    .input(z.object({ categoryId: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      // selecting posts with joined categories (one row per post/category)
      const q = ctx.db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          content: posts.content,
          published: posts.published,
          created_at: posts.created_at,
          image_url: posts.image_url,
          category_id: post_categories.category_id,
          category_name: categories.name,
        })
        .from(posts)
        .leftJoin(post_categories, eq(post_categories.post_id, posts.id))
        .leftJoin(categories, eq(post_categories.category_id, categories.id))
        .orderBy(posts.created_at);

      if (input?.categoryId) {
        q.where(eq(post_categories.category_id, input.categoryId));
      }

      const rows = await q;

      // group rows by post id and aggregate categories into an array
      const map = new Map<number, any>();
      for (const r of rows) {
        const id = r.id as number;
        if (!map.has(id)) {
          map.set(id, {
            id: r.id,
            title: r.title,
            slug: r.slug,
            content: r.content,
            published: r.published,
            created_at: r.created_at,
            image_url: r.image_url,
            categories: [],
          });
        }
        if (r.category_id) {
          const entry = map.get(id);
          entry.categories.push({ id: r.category_id, name: r.category_name });
        }
      }

      return Array.from(map.values());
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
    const rows = await ctx.db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        published: posts.published,
        created_at: posts.created_at,
        image_url: posts.image_url,
        category_id: categories.id,
        category_name: categories.name,
      })
      .from(posts)
      .where(eq(posts.slug, input.slug))
      .leftJoin(post_categories, eq(post_categories.post_id, posts.id))
      .leftJoin(categories, eq(post_categories.category_id, categories.id));

    if (rows.length === 0) return null;
    const { id, title, slug, content, published, created_at, image_url } = rows[0];
    const cats = rows.filter((r) => r.category_id).map((r) => ({ id: r.category_id, name: r.category_name }));
    return { id, title, slug, content, published, created_at, image_url, categories: cats };
  }),

  update: publicProcedure.input(updatePostSchema).mutation(async ({ input, ctx }) => {
    await ctx.db
      .update(posts)
      .set({
        title: input.title,
        slug: slugify(input.title),
        content: input.content,
        published: input.published ?? false,
      })
      .where(eq(posts.id, input.id));

    // remove existing mapping then insert new ones
    await ctx.db.delete(post_categories).where(eq(post_categories.post_id, input.id));
    if (input.categoryIds && input.categoryIds.length) {
      await Promise.all(
        input.categoryIds.map((cid) => ctx.db.insert(post_categories).values({ post_id: input.id, category_id: cid }))
      );
    }

    const [row] = await ctx.db.select().from(posts).where(eq(posts.id, input.id));
    return row;
  }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    await ctx.db.delete(post_categories).where(eq(post_categories.post_id, input.id));
    await ctx.db.delete(posts).where(eq(posts.id, input.id));
    return { success: true };
  }),
});
