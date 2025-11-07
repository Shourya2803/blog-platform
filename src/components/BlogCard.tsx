"use client";
// import { motion } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";

export default function BlogCard({ post, search, selectedCategory }: { post: any; search?: string; selectedCategory?: string }) {
  // defensive guards: some posts (during dev) may lack content or categories
  const contentText = typeof post?.content === "string" ? post.content : "";
  const wordCount = contentText.trim() ? contentText.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const categories = Array.isArray(post?.categories) ? post.categories : [];

  // derived values
  const imageUrl = post?.image_url && typeof post.image_url === "string" ? post.image_url : null;
  const isDataUrl = typeof imageUrl === "string" && imageUrl.startsWith("data:");
  const createdAt = post?.created_at ? new Date(post.created_at) : null;
  const createdLabel = createdAt ? createdAt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

  // primary category (first) and its color
  const primaryCategoryName = categories.length > 0 ? String(categories[0].name ?? "") : "";
  let primaryColorClass = "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-100";
  if (primaryCategoryName) {
    const palette = [
      "bg-rose-100 text-rose-700 dark:bg-rose-700 dark:text-rose-100",
      "bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100",
      "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100",
      "bg-violet-100 text-violet-700 dark:bg-violet-700 dark:text-violet-100",
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-700 dark:text-fuchsia-100",
      "bg-lime-100 text-lime-700 dark:bg-lime-700 dark:text-lime-100",
      "bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-pink-100",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100",
    ];
    let hash = 0;
    for (let i = 0; i < primaryCategoryName.length; i++) {
      hash = (hash << 5) - hash + primaryCategoryName.charCodeAt(i);
      hash |= 0;
    }
    primaryColorClass = palette[Math.abs(hash) % palette.length];
  }

  // title highlighting for search
  const title = post?.title ?? "Untitled";
  const searchTerm = typeof search === "string" && search.trim() ? search.trim() : null;
  let titleNode: any = title;
  if (searchTerm) {
    const idx = title.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx !== -1) {
      titleNode = (
        <>
          {title.slice(0, idx)}
          <span className="bg-yellow-100 dark:bg-yellow-600 text-yellow-800 dark:text-yellow-50 px-0.5">{title.slice(idx, idx + searchTerm.length)}</span>
          {title.slice(idx + searchTerm.length)}
        </>
      );
    }
  }

  return (
    <motion.div
      className="h-full flex flex-col overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer"
      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(167,139,250,0.4)" }}
    >
      {/* Image */}
      <div className="w-full h-40 relative bg-gray-50 dark:bg-zinc-800 overflow-hidden">
        {imageUrl ? (
          isDataUrl ? (
            // data URLs (development fallback) — use a plain img tag
            // width/height styles applied to fill container
            <img
              src={imageUrl}
              alt={post?.title || "cover"}
              className="w-full h-full object-cover"
            />
          ) : (
            // use next/image when possible for optimization for external URLs
            <Image src={imageUrl} alt={post?.title || "cover"} fill className="object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">

  <h2 className="text-2xl font-semibold text-purple-600 mb-2">{titleNode}</h2>

        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400 mb-3">
          <div>{createdLabel}</div>
          <div> {readingTime} min read · {wordCount} words</div>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 flex-1">{contentText}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map((cat: any) => {
            const isSelected = selectedCategory && cat.name === selectedCategory;

            // deterministic color picker based on category name
            const palette = [
              "bg-rose-100 text-rose-700 dark:bg-rose-700 dark:text-rose-100",
              "bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100",
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-700 dark:text-emerald-100",
              "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100",
              "bg-violet-100 text-violet-700 dark:bg-violet-700 dark:text-violet-100",
              "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-700 dark:text-fuchsia-100",
              "bg-lime-100 text-lime-700 dark:bg-lime-700 dark:text-lime-100",
              "bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-pink-100",
              "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100",
            ];

            const name = String(cat?.name ?? "");
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
              hash = (hash << 5) - hash + name.charCodeAt(i);
              hash |= 0;
            }
            const colorClass = palette[Math.abs(hash) % palette.length];

            return (
              <span
                key={cat.id}
                className={
                  (isSelected
                    ? "px-3 py-1 rounded-full bg-purple-600 text-white text-xs"
                    : `px-3 py-1 rounded-full text-xs ${colorClass}`) +
                  ""
                }
              >
                {cat.name}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}


