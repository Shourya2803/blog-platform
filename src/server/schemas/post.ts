import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  published: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional()
});

export const updatePostSchema = createPostSchema.extend({
  id: z.number().optional()
});
