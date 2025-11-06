"use client";
// import { motion } from "framer-motion";
import { motion } from "framer-motion";

export default function BlogCard({ post }: { post: any }) {
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <motion.div
      className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer"
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(167,139,250,0.4)" }}
    >
      <h2 className="text-2xl font-semibold text-purple-600 mb-2">{post.title}</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-3">{post.content}</p>
      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400 mt-2">
        <span>{wordCount} words</span>
        <span>{readingTime} min read</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {post.categories.map((cat: any) => (
          <span
            key={cat.id}
            className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs dark:bg-purple-700 dark:text-purple-100"
          >
            {cat.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
;
