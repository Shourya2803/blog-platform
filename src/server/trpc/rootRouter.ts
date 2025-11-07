import { router } from "./trpc";
import { postRouter } from "./routers/post";
import { categoryRouter } from "./routers/category";
import { uploadRouter } from "./routers/upload";

export const appRouter = router({
  post: postRouter,
  category: categoryRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
