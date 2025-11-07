import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  image_url: z.string().url("Image URL must be valid"),
  published: z.boolean().default(false),
  categoryIds: z.array(z.number()).min(1, "At least one category required"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
