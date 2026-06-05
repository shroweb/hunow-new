import process from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  dataUrl: z.string().startsWith("data:image/"),
});

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(uploadSchema)
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./auth.server");
    await requireAdmin();

    const match = data.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) throw new Error("Unsupported image data.");

    const mime = match[1];
    const ext = extensionFor(mime, data.fileName);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(match[2], "base64");

    // Use Vercel Blob when token is available (production + any env with it set)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${id}`, buffer, {
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
      });
      return { url: blob.url };
    }

    // On Vercel without a Blob token the filesystem is read-only — fail clearly
    if (process.env.VERCEL) {
      throw new Error(
        "Image uploads are not configured. Add BLOB_READ_WRITE_TOKEN to your Vercel environment variables (Storage → Blob).",
      );
    }

    // Local development: write to public/uploads/
    const uploadDir = resolve(process.cwd(), "public/uploads");
    const filePath = resolve(uploadDir, id);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    return { url: `/uploads/${id}` };
  });

function extensionFor(mime: string, fileName: string) {
  const existing = extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(existing)) return existing;
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/avif") return ".avif";
  return ".jpg";
}
