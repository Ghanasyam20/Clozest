import { getSupabaseAdmin, BUCKETS } from "@/lib/supabase";

export interface UploadResult {
  publicUrl: string;
  path:      string;
}

/**
 * Upload a file to Supabase Storage.
 * Called from server-side only (Route Handler or Server Action).
 */
export async function uploadImage(
  file:      File,
  userId:    string,
  bucket:    keyof typeof BUCKETS = "WARDROBE"
): Promise<UploadResult> {
  const supabase   = await getSupabaseAdmin();
  const bucketName = BUCKETS[bucket];

  const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const randomId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const filePath = `${userId}/${randomId}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType:  file.type,
      cacheControl: "3600",
      upsert:       false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return { publicUrl: urlData.publicUrl, path: filePath };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteImage(
  path:   string,
  bucket: keyof typeof BUCKETS = "WARDROBE"
): Promise<void> {
  const supabase   = await getSupabaseAdmin();
  const bucketName = BUCKETS[bucket];

  const { error } = await supabase.storage.from(bucketName).remove([path]);
  if (error) console.error("[Storage] Delete failed:", error.message);
}

/**
 * Generate a signed URL (for private buckets).
 */
export async function getSignedUrl(
  path:      string,
  bucket:    keyof typeof BUCKETS = "WARDROBE",
  expiresIn: number = 3600
): Promise<string> {
  const supabase   = await getSupabaseAdmin();
  const bucketName = BUCKETS[bucket];

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(path, expiresIn);

  if (error || !data) throw new Error(`Failed to generate signed URL: ${error?.message}`);
  return data.signedUrl;
}
