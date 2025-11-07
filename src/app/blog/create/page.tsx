"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { useToast } from "@/components/ToastProvider";
// NOTE: react-quill removed to avoid build-time dependency; using textarea fallback instead.
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
} from "@/components/ui/command";
import { Check, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
// import BlogCard from "@/components/blogCard";
import BlogCard from "@/components/BlogCard";

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryIds: z.array(z.number()).min(1, "Select at least one category"),
  image_url: z.string().url().optional().or(z.literal("")).optional(),
  published: z.boolean().optional(),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  // quillRef removed since react-quill is not used

  // tRPC
  const { data: categories = [], isLoading: catsLoading } =
    trpc.category.getAll.useQuery();
  const uploadMutation = trpc.upload.uploadImage.useMutation();
  const createPost = trpc.post.create.useMutation();
  const createCategory = trpc.category.create.useMutation();
  const utils = trpc.useContext();
  const toast = useToast();

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryIds: [],
      image_url: "",
      published: true,
    },
  });

  const selectedCategories = watch("categoryIds");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEditorHtml = useRef<string>("");


  // Live preview derived from form state + upload/local preview
  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const watchedImageUrl = watch("image_url");
  // Sync external content -> editor, but avoid clobbering while user is typing
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return; // don't update while focused (typing)
    const target = watchedContent || "";
    if (el.innerHTML !== target) {
      el.innerHTML = target;
      lastEditorHtml.current = target;
    }
  }, [watchedContent]);
  const previewCategories = categories.filter((c) =>
    selectedCategories.includes(c.id)
  );
  const previewImage = uploadedImageUrl ?? localPreview ?? watchedImageUrl ?? "";
  const postPreview = {
    title: watchedTitle || "Untitled",
    content: watchedContent || "",
    categories: previewCategories,
    image_url: previewImage,
    created_at: new Date().toISOString(),
  } as any;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await uploadMutation.mutateAsync({ base64 });
        if (res?.url) {
          setUploadedImageUrl(res.url);
          setValue("image_url", res.url);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleCategory = (id: number) => {
    const current = new Set(selectedCategories);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setValue("categoryIds", Array.from(current), { shouldValidate: true });
  };

  const handleCreateCategory = async () => {
    if (!searchTerm.trim()) return;
    try {
      const created = await createCategory.mutateAsync({ name: searchTerm });
      await utils.category.getAll.invalidate();
      toggleCategory(created.id);
      setSearchTerm("");
      setOpen(false);
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to create category");
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    if (!data.image_url && localPreview && !uploadedImageUrl) {
      alert("Please wait for image upload to finish.");
      return;
    }
    try {
      await createPost.mutateAsync({
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        image_url: data.image_url ?? "",
        categoryIds: data.categoryIds ?? [],
      } as any);
      // show toast and navigate
      toast.showToast("Post created", "success");
      router.push("/blog");
    } catch (err: any) {
      console.error("Create post failed", err);
      toast.showToast(err?.message ?? "Failed to create post", "error");
    }
  };

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
                 Create a New Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-9 text-zinc-700 dark:text-zinc-200"
              >
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Enter your post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content - lightweight contentEditable rich editor (no external deps) */}
            <div>
              <Label htmlFor="content">Content</Label>
              <div className="mt-2 mb-1 flex gap-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded border"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const el = editorRef.current;
                    if (el) el.focus();
                    document.execCommand("bold");
                  }}
                  aria-label="Bold"
                >
                  B
                </button>

                <button
                  type="button"
                  className="px-2 py-1 rounded border"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const el = editorRef.current;
                    if (el) el.focus();
                    document.execCommand("italic");
                  }}
                  aria-label="Italic"
                >
                  I
                </button>

                <button
                  type="button"
                  className="px-2 py-1 rounded border"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const el = editorRef.current;
                    if (el) el.focus();
                    document.execCommand("underline");
                  }}
                  aria-label="Underline"
                >
                  U
                </button>

               
              </div>

              <div
                id="editor"
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-40 rounded border px-3 py-2 bg-white text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                onInput={(e) => {
                  const html = (e.target as HTMLDivElement).innerHTML;
                  lastEditorHtml.current = html;
                  setValue("content", html, { shouldValidate: true, shouldDirty: true });
                }}
                onBlur={(e) => {
                  const html = (e.target as HTMLDivElement).innerHTML;
                  lastEditorHtml.current = html;
                  setValue("content", html, { shouldValidate: true, shouldDirty: true });
                }}
              />

              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <Label>Categories</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCategories.length > 0
                      ? `${selectedCategories.length} selected`
                      : "Select categories"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search or create category..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      {catsLoading ? (
                        <CommandEmpty>Loading...</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {categories.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              onSelect={() => toggleCategory(cat.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCategories.includes(cat.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {cat.name}
                            </CommandItem>
                          ))}
                          {searchTerm &&
                            !categories.some(
                              (c) =>
                                c.name.toLowerCase() ===
                                searchTerm.toLowerCase()
                            ) && (
                              <CommandItem
                                onSelect={handleCreateCategory}
                                className="text-blue-500"
                              >
                                <Plus className="mr-2 h-4 w-4" /> Create “
                                {searchTerm}”
                              </CommandItem>
                            )}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected categories display */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCategories.length > 0 &&
                  selectedCategories.map((id) => {
                    const category = categories.find((c) => c.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        onClick={() => toggleCategory(id)}
                      >
                        {category?.name ?? "Unknown"}
                      </Badge>
                    );
                  })}
              </div>

              {errors.categoryIds && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.categoryIds.message}
                </p>
              )}
            </div>

              {/* Image upload */}
              <div>
                <Label>Cover Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2"
                />
                {uploadingImage && (
                  <p className="text-sm text-gray-500 mt-2">Uploading image…</p>
                )}
                {/* keep the local/remote image states, final preview uses BlogCard */}
                {uploadedImageUrl ? (
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="mt-3 w-full sm:w-72 rounded-lg object-cover shadow-sm"
                  />
                ) : localPreview ? (
                  <img
                    src={localPreview}
                    alt="Preview"
                    className="mt-3 w-full sm:w-72 rounded-lg object-cover opacity-70 shadow-sm"
                  />
                ) : null}
              </div>

            {/* Publish */}
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("published")} />
              <Label>Publish immediately</Label>
            </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || createPost.status === "pending"}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting || createPost.status === "pending"
                    ? "Creating..."
                    : "Create Post"}
                </Button>
              </div>
            </form>
          </CardContent>
          </Card>
        </div>

        {/* Preview column */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Live preview</h3>
            <BlogCard post={postPreview} />
          </div>
        </aside>
      </div>
    </div>
  );
}
