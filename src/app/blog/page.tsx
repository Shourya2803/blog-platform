"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";

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

  if (isLoading) return <div className="text-center py-32">Loading posts...</div>;
  if (isError) return <div className="text-center py-32">Error loading posts.</div>;

  const totalPages = Math.ceil(((posts?.length as number) || 0) / postsPerPage);
  const paginated = posts ? posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage) : [];

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
        <div className="grid md:grid-cols-2 gap-6">
          {paginated.map((post: any, idx: number) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

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
        {recentPosts?.map((post: any) => (
          <RecentPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
