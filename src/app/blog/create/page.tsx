"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { useToast } from "@/components/ToastProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const watchedImageUrl = watch("image_url");

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
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
      toast.showToast("Image upload failed.", "error");
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
      toast.showToast("Failed to create category", "error");
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    if (!data.image_url && localPreview && !uploadedImageUrl) {
      toast.showToast("Please wait — image is still uploading", "info");
      return;
    }
    try {
      // show a quick loading toast when starting the create request
      toast.showToast("Creating post...", "info");
      await createPost.mutateAsync({
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        image_url: data.image_url ?? "",
        categoryIds: data.categoryIds ?? [],
      } as any);

      const wasPublished = Boolean(data.published);
      if (wasPublished) {
        toast.showToast("Post published", "success");
        router.push("/blog");
      } else {
        toast.showToast("Saved to drafts", "success");
        router.push("/drafts");
      }
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Form Section */}
        <div className="lg:col-span-2">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-zinc-100 text-center sm:text-left">
                Create a New Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 text-zinc-700 dark:text-zinc-200"
              >
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter your post title"
                    className="mt-1"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Editor */}
                <div>
                  <Label>Content</Label>
                  <div className="mt-2 mb-2 flex flex-wrap gap-2 sm:gap-3">
                    {["bold", "italic", "underline"].map((cmd) => (
                      <button
                        key={cmd}
                        type="button"
                        className="px-2 sm:px-3 py-1 rounded border text-sm sm:text-base"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const el = editorRef.current
                          if (el) el.focus()
                          document.execCommand(cmd)
                        }}
                      >
                        {cmd.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-40 rounded border px-3 py-2 bg-white dark:bg-zinc-900 text-sm sm:text-base"
                    onInput={(e) =>
                      setValue("content", (e.target as HTMLDivElement).innerHTML, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <Label>Categories</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between mt-1 text-sm sm:text-base"
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

                  {/* Category badges */}
                  <div className="flex flex-wrap gap-2 mt-3 max-h-20 overflow-y-auto">
                    {selectedCategories.map((id) => {
                      const category = categories.find((c) => c.id === id)
                      return (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-700"
                          onClick={() => toggleCategory(id)}
                        >
                          {category?.name ?? "Unknown"}
                        </Badge>
                      )
                    })}
                  </div>
                  {errors.categoryIds && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryIds.message}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Cover Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 w-full text-sm"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-gray-500 mt-2">
                      Uploading image…
                    </p>
                  )}
                  {(uploadedImageUrl || localPreview) && (
                    <img
                      src={uploadedImageUrl || localPreview!}
                      alt="Preview"
                      className="mt-3 w-full sm:w-80 rounded-lg object-cover shadow-sm"
                    />
                  )}
                </div>

                {/* Publish toggle */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register("published")} />
                  <Label>Publish immediately</Label>
                </div>

                {/* Submit */}
                <div className="pt-2 flex justify-center sm:justify-start">
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

        {/* RIGHT: Live Preview */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 text-center sm:text-left">
              Live Preview
            </h3>
            <div className="max-w-sm mx-auto sm:mx-0">
              <BlogCard post={postPreview} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
