"use client";

import { motion } from "framer-motion";
import {
  ImageIcon,
  FileText,
  Clock,
  Eye,
  FileSignature,
} from "lucide-react";

const features = [
  {
    icon: <ImageIcon className="w-8 h-8 text-purple-500" />,
    title: "Create Blogs with Images",
    description: "Add images to your posts to make them more engaging and expressive.",
  },
  {
    icon: <FileText className="w-8 h-8 text-purple-500" />,
    title: "Markdown Editor",
    description: "Write in a distraction-free editor with markdown support for fast formatting.",
  },
  {
    icon: <FileSignature className="w-8 h-8 text-purple-500" />,
    title: "Draft & Published",
    description: "Save drafts and publish posts when you’re ready for the world to see.",
  },
  {
    icon: <Clock className="w-8 h-8 text-purple-500" />,
    title: "Word Count",
    description: "Keep track of the length of your posts and optimize your writing.",
  },
  {
    icon: <Eye className="w-8 h-8 text-purple-500" />,
    title: "Reading Time",
    description: "Show readers an estimated reading time for every post.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white-50 dark:bg-gray-900 text-center">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-12">
          Powerful Features for Every Writer
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="relative p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg transition-transform duration-300 ease-out group hover:-translate-y-1"
            >
              {/* glow layer */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -inset-px blur-3xl bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 opacity-30" />
              </div>

              <div className="flex flex-col items-center gap-4 relative">
                {feature.icon}
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-6">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
