import { IMAGE_BUCKET, publicImageUrl } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const MAX_SIDE = 1600;

/** Shrinks the image in the browser before upload so the 1 GB free storage lasts. */
async function prepare(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  // Animated GIFs would lose their animation on a canvas.
  if (file.type === "image/gif") return { blob: file, ext: "gif", type: "image/gif" };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Bu görsel açılamadı. JPG, PNG ya da WEBP bir dosya dene.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob("image/webp", 0.82);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp", type: "image/webp" };
  const jpeg = await toBlob("image/jpeg", 0.85);
  if (!jpeg) throw new Error("Görsel hazırlanamadı.");
  return { blob: jpeg, ext: "jpg", type: "image/jpeg" };
}

export async function uploadImage(file: File, folder: "covers" | "posts"): Promise<{ path: string; url: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Yalnızca görsel dosyaları yüklenebilir.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Görsel en fazla 25 MB olabilir.");

  const { blob, ext, type } = await prepare(file);
  if (blob.size > 5 * 1024 * 1024) throw new Error("Görsel küçültüldükten sonra bile 5 MB'tan büyük. Daha küçük bir dosya dene.");

  const path = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createBrowserSupabase()
    .storage.from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error("Görsel yüklenemedi. Oturumun açık mı?");

  return { path, url: publicImageUrl(path)! };
}
