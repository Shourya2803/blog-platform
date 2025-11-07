"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";

export default function BlogDetailPage() {
  const { id } = useParams();
  const { data: post, isLoading, isError } = trpc.post.getBySlug.useQuery({ slug: String(id) });

  // Hooks that must run on every render (avoid conditional hooks)
  const utils = trpc.useContext();
  const updateMutation = trpc.post.update.useMutation({
    onSuccess: async () => {
      // invalidate queries so UI refreshes
      await utils.post.getBySlug.invalidate({ slug: String(id) });
      await utils.post.getAll.invalidate();
    },
  });

  const [editing, setEditing] = useState(false);
  const [contentValue, setContentValue] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [publishedValue, setPublishedValue] = useState(false);

  const { data: allCategories } = trpc.category.getAll.useQuery();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const applyFormat = (cmd: string, value?: string) => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    // execCommand is deprecated but still works for simple use-cases
    // using it here avoids adding a heavy dependency for an editor
    // in this small app. For production, consider a proper editor lib.
    // @ts-ignore
    document.execCommand(cmd, false, value);
    setContentValue(contentRef.current.innerHTML || "");
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL (include https://)");
    if (!url) return;
    applyFormat('createLink', url);
  };

  useEffect(() => {
    if (post) {
      setContentValue(post.content ?? "");
      setPublishedValue(Boolean(post.published));
      setSelectedCategoryIds((post.categories || []).map((c: any) => c.id));
    }
  }, [post]);

  // When entering edit mode, populate the contentEditable innerHTML once.
  useEffect(() => {
    if (editing && contentRef.current) {
      contentRef.current.innerHTML = contentValue || "";
    }
  // only run when editing toggles or when the ref changes
  }, [editing]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    // reset to original values
    if (post) {
      setContentValue(post.content ?? "");
      setPublishedValue(Boolean(post.published));
      setSelectedCategoryIds((post.categories || []).map((c: any) => c.id));
    }
    setEditing(false);
  };

  const saveEdit = async () => {
    if (!post) return;
    updateMutation.mutate({
      id: post.id,
      title: post.title,
      content: contentValue,
      categoryIds: selectedCategoryIds,
      published: publishedValue,
    }, {
      onSuccess: () => setEditing(false),
    });
  };

  if (isLoading)
    return (
      <motion.div
        className="max-w-4xl mx-auto px-6 py-12 animate-pulse"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Back link skeleton */}
        <div className="mb-6 w-28 h-5 rounded bg-gray-200 dark:bg-zinc-700" />

        {/* Image / hero skeleton */}
        <div className="w-full h-80 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-6" />

        {/* Title skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-4" />

        {/* Meta skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-36" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24" />
        </div>

        {/* Content skeleton lines */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 dark:bg-zinc-700 rounded ${i % 3 === 0 ? 'w-5/6' : 'w-full'}`} />
          ))}
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-24 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          ))}
        </div>
      </motion.div>
    );

  if (isError || !post)
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center text-red-600">
        Blog not found.
      </div>
    );

  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <motion.div
      className="max-w-4xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-6">
        <Link href="/blog" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
          <ArrowLeft size={18} /> Back to Blogs
        </Link>

        {/* Edit controls */}
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-sm"
            >
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={saveEdit}
                disabled={updateMutation.status === 'pending'}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-600 text-white text-sm"
              >
                <Save size={14} /> {updateMutation.status === 'pending' ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={updateMutation.status === 'pending'}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border text-sm"
              >
                <X size={14} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {post.image_url && (
        <div className="w-full h-80 relative mb-8 rounded-xl overflow-hidden">
          <Image src={post.image_url} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <h1 className="text-4xl font-bold text-purple-700 mb-4">{post.title}</h1>
      <div className="flex justify-between text-sm text-gray-500 mb-6">
        <span>
          {new Date(post.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>{readingTime} min read • {wordCount} words</span>
      </div>

      {editing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-2">
              <button type="button" onClick={() => applyFormat('bold')} className="px-2 py-1 rounded-md border">B</button>
              <button type="button" onClick={() => applyFormat('italic')} className="px-2 py-1 rounded-md border">I</button>
              <button type="button" onClick={() => applyFormat('underline')} className="px-2 py-1 rounded-md border">U</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'H2')} className="px-2 py-1 rounded-md border">H2</button>
              <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="px-2 py-1 rounded-md border">• List</button>
              <button type="button" onClick={() => applyFormat('insertOrderedList')} className="px-2 py-1 rounded-md border">1. List</button>
              <button type="button" onClick={() => insertLink()} className="px-2 py-1 rounded-md border">Link</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'PRE')} className="px-2 py-1 rounded-md border">Code</button>
              <button type="button" onClick={() => applyFormat('removeFormat')} className="px-2 py-1 rounded-md border">Clear</button>
            </div>

            {/* Editable area (do not set innerHTML via props on every render — that resets caret) */}
            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => setContentValue(contentRef.current?.innerHTML ?? '')}
              className="min-h-[220px] p-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm prose dark:prose-invert"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {(allCategories || []).map((cat: any) => {
                const checked = selectedCategoryIds.includes(cat.id);
                return (
                  <label key={cat.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-md border cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedCategoryIds((prev) =>
                          prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                        );
                      }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={publishedValue}
                onChange={(e) => setPublishedValue(e.target.checked)}
              />
              <span className="text-sm">Published</span>
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className="prose dark:prose-invert max-w-none leading-relaxed text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="flex flex-wrap gap-2 mt-8">
            {post.categories.map((c: any) => (
              <span
                key={c.id}
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm dark:bg-purple-700 dark:text-white"
              >
                {c.name}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
