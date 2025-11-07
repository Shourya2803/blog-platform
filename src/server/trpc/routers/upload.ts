import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../trpc";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  // normalize cloud name to lowercase (Cloudinary cloud names are lowercase)
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.toLowerCase(),
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload buffer directly to Cloudinary
async function uploadImageToCloudinaryFromBuffer(buffer: Buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "blog_images" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
}

export const uploadRouter = router({
  uploadImage: publicProcedure
    .input(
      z.object({
        base64: z.string(), 
      })
    )
    .mutation(async ({ input }) => {
      const base64Data = input.base64.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");

      try {
        const result: any = await uploadImageToCloudinaryFromBuffer(buffer);
        return { url: result.secure_url };
      } catch (err: any) {
        // Surface a clearer TRPC error while preserving original message in logs
        console.error("Cloudinary upload error:", err?.message ?? err);

        // In development, fallback to returning the original data URL so dev flow continues
        if (process.env.NODE_ENV !== "production") {
          console.warn("Cloudinary upload failed — returning data URL fallback for development.");
          // input.base64 originally was a data URL (data:<mime>;base64,<data>)
          return { url: input.base64 } as any;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Cloudinary upload failed: ${err?.message ?? "unknown error"}`,
        });
      }
    }),
});
