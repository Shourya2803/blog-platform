"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <section className="flex flex-col items-center justify-center text-center py-16 sm:py-20 bg-white dark:bg-gray-900 transition-colors">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4"
      >
        Welcome to <span className="text-purple-600">Blogify</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 dark:text-gray-300 max-w-xl mb-6 px-4 text-sm sm:text-base"
      >
        Discover stories, share your thoughts, and express yourself through words.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative inline-block group">
          <span className="pointer-events-none absolute -inset-1 rounded-full blur-3xl bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-0 group-hover:opacity-30 transition-opacity" />
          <Button
            className="relative z-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 sm:px-6 py-2.5 sm:py-3"
            onClick={() => router.push('/blog/create')}
          >
            Start Writing →
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
