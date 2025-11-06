"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";
import { FileText, PlusCircle } from "lucide-react";

import BlogCard from "@/components/BlogCard";

import RecentPostCard from "@/components/RecentPostCard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BlogsPage() {
  const postsPerPage = 3;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch posts and categories from server (server router names are `post` and `category`)
  const { data: posts, isLoading, isError } = trpc.post.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();

  // Recent posts derived client-side from posts (simpler than adding a new server procedure)
  const recentPosts = posts ? posts.slice(0, 3) : undefined;

  // polished loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="animate-pulse grid md:grid-cols-2 gap-6">
          {Array.from({ length: postsPerPage }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-gray-100 dark:bg-zinc-800">
              <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded mb-2 w-5/6" />
              <div className="flex justify-between mt-4">
                <div className="h-3 w-20 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-3 w-12 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center text-red-600">
        Something went wrong while loading posts. Please try again later.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(((posts?.length as number) || 0) / postsPerPage));
  const paginated = posts ? posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage) : [];
  const isEmpty = !isLoading && (!posts || posts.length === 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
      {/* Main Content */}
      <div className="md:col-span-3 space-y-6">
        {/* Search + Category Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Posts Grid */}
        {isEmpty ? (
          <div className="col-span-3 flex items-center justify-center">
            <div className="w-full md:w-2/3 p-12 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-2xl font-semibold mb-2">No blogs yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">There are no posts to show. Start by creating your first blog post to engage readers.</p>
              <a href="/posts/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                <PlusCircle size={18} /> Create your first post
              </a>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {paginated.map((post: any, idx: number) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-8">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Prev
          </Button>
          <span className="flex items-center px-3">{currentPage} / {totalPages}</span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-purple-600">Recent Posts</h2>
        {recentPosts && recentPosts.length > 0 ? (
          recentPosts.map((post: any) => <RecentPostCard key={post.id} post={post} />)
        ) : (
          <div className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-0">No recent posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
