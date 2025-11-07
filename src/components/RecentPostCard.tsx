"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RecentPostCard({ post }: { post: any }) {
  const wordCount = String(post?.content ?? "").split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link href={`/blog/${post.slug ?? post.id}`} aria-label={`Open ${post.title}`} className="block">
      <motion.div
        className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition"
        whileHover={{ scale: 1.02 }}
      >
        <h3 className="text-lg font-semibold text-purple-600">{post.title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          {readingTime} min read · {wordCount} words
        </p>
      </motion.div>
    </Link>
  );
}
