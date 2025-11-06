"use client";
import { motion } from "framer-motion";

export default function RecentPostCard({ post }: { post: any }) {
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <motion.div
      className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      <h3 className="text-lg font-semibold text-purple-600">{post.title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
        {readingTime} min read · {wordCount} words
      </p>
    </motion.div>
  );
}
