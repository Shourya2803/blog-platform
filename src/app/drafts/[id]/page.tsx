"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
// use regular img tag for draft preview image to avoid remotePatterns config issues
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";

export default function DraftDetailPage() {
  const { id } = useParams();
  const { data: post, isLoading, isError } = trpc.post.getBySlug.useQuery({ slug: String(id) });
  const router = useRouter();

  const utils = trpc.useContext();
  const updateMutation = trpc.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.getBySlug.invalidate({ slug: String(id) });
      await utils.post.getDrafts.invalidate();
    },
  });
  const deleteMutation = trpc.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.getDrafts.invalidate();
      router.push("/drafts");
    },
    onError: (err) => {
      console.error("Delete failed", err);
      alert(err?.message ?? "Failed to delete draft");
    },
  });

  const [editing, setEditing] = useState(false);
  const [contentValue, setContentValue] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [publishedValue, setPublishedValue] = useState(false);

  const { data: allCategories } = trpc.category.getAll.useQuery();
  const createCategory = trpc.category.create.useMutation();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const applyFormat = (cmd: string, value?: string) => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    // simple formatting via execCommand for now
    // @ts-ignore
    document.execCommand(cmd, false, value);
    setContentValue(contentRef.current.innerHTML || "");
  };

  useEffect(() => {
    if (post) {
      setContentValue(post.content ?? "");
      setPublishedValue(Boolean(post.published));
      setSelectedCategoryIds((post.categories || []).map((c: any) => c.id));
    }
  }, [post]);

  useEffect(() => {
    if (editing && contentRef.current) {
      contentRef.current.innerHTML = contentValue || "";
    }
  }, [editing]);

  const startEdit = () => setEditing(true);
  const cancelEdit = () => {
    if (post) {
      setContentValue(post.content ?? "");
      setPublishedValue(Boolean(post.published));
      setSelectedCategoryIds((post.categories || []).map((c: any) => c.id));
    }
    setEditing(false);
  };

  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!post) return;
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!post) return;
    try {
      deleteMutation.mutate({ id: post.id }, {
        onSuccess: () => {
          toast.showToast("Draft deleted", "success");
        },
        onError: (err: any) => {
          toast.showToast(err?.message ?? "Failed to delete draft", "error");
        }
      });
    } catch (err) {
      console.error("Delete mutation failed", err);
      toast.showToast("Delete failed", "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  const doSave = () => {
    if (!post) return;
    const wasPublished = Boolean(post.published);

    updateMutation.mutate({
      id: post.id,
      title: post.title,
      content: contentValue,
      categoryIds: selectedCategoryIds,
      published: publishedValue,
    }, {
      onSuccess: () => {
        setEditing(false);
        // If published status changed, show a published/unpublished toast
        if (!wasPublished && publishedValue) {
          toast.showToast("Draft published", "success");
        } else if (wasPublished && !publishedValue) {
          toast.showToast("Draft unpublished", "success");
        } else {
          toast.showToast("Draft saved", "success");
        }
      },
      onError: (err: any) => {
        toast.showToast(err?.message ?? "Failed to save draft", "error");
      }
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
        <div className="mb-6 w-28 h-5 rounded bg-gray-200 dark:bg-zinc-700" />
        <div className="w-full h-60 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-6" />
        <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 dark:bg-zinc-700 rounded ${i % 3 === 0 ? 'w-5/6' : 'w-full'}`} />
          ))}
        </div>
      </motion.div>
    );

  if (isError || !post)
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-center text-red-600">Draft not found.</div>
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
        <Link href="/drafts" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
          <ArrowLeft size={18} /> Back to Drafts
        </Link>

        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-sm"
              >
                <Edit2 size={16} /> Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.status === 'pending'}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={doSave}
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
        <div className="w-full h-60 mb-8 rounded-xl overflow-hidden bg-gray-100">
          <img src={post.image_url} alt={post.title} className="w-full h-60 object-cover" />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete draft"
        description="Are you sure you want to permanently delete this draft? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirmAction={doDelete}
        onCancelAction={() => setConfirmOpen(false)}
      />

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

            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className="px-2 py-1 rounded-md border"
                aria-label="Bold"
              >
                B
              </button>

              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className="px-2 py-1 rounded-md border"
                aria-label="Italic"
              >
                I
              </button>

              <button
                type="button"
                onClick={() => applyFormat('underline')}
                className="px-2 py-1 rounded-md border"
                aria-label="Underline"
              >
                U
              </button>
            </div>

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
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category"
                className="px-2 py-1 rounded-md border bg-white dark:bg-zinc-900 text-sm"
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!newCategoryName.trim()) return;
                    try {
                      setAddingCategory(true);
                      const created = await createCategory.mutateAsync({ name: newCategoryName.trim() });
                      await utils.category.getAll.invalidate();
                      setSelectedCategoryIds((prev) => [...prev, created.id]);
                      setNewCategoryName("");
                    } catch (err) {
                      console.error("Failed to create category", err);
                      alert("Failed to create category");
                    } finally {
                      setAddingCategory(false);
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newCategoryName.trim()) return;
                  try {
                    setAddingCategory(true);
                    const created = await createCategory.mutateAsync({ name: newCategoryName.trim() });
                    await utils.category.getAll.invalidate();
                    setSelectedCategoryIds((prev) => [...prev, created.id]);
                    setNewCategoryName("");
                  } catch (err) {
                    console.error("Failed to create category", err);
                    alert("Failed to create category");
                  } finally {
                    setAddingCategory(false);
                  }
                }}
                className="px-3 py-1 rounded-md bg-purple-600 text-white text-sm"
                disabled={addingCategory}
              >
                {addingCategory ? "Adding..." : "Add"}
              </button>
            </div>

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


