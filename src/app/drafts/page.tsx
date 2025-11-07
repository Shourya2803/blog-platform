"use client";

import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DraftsPage() {
  const { data: drafts, isLoading, isError } = trpc.post.getDrafts.useQuery();

  if (isLoading)
    return (
      <motion.div
        className="max-w-5xl mx-auto px-6 py-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="w-full h-44 bg-gray-200 dark:bg-zinc-800" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-5/6" />
                </div>
                <div className="mt-4">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-700 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );

  if (isError)
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-red-600">
        Failed to load drafts.
      </div>
    );

  if (!drafts || drafts.length === 0)
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-gray-500">
        No drafts yet.
      </div>
    );

  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-4xl font-bold text-purple-700 mb-8">Drafts</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {drafts.map((draft: any) => (
          <motion.div
            key={draft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href={`/drafts/${draft.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition rounded-2xl">
                {draft.image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={draft.image_url}
                      alt={draft.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">
                    {draft.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(draft.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 line-clamp-3">
                    {draft.content.slice(0, 120)}...
                  </p>
                  <div className="mt-3 text-xs text-orange-600 font-semibold">
                    Status: Draft
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
