import { supabase } from "@/integrations/supabase/client";

export const PUBLIC_BUCKET = "public-media";
export const PREMIUM_BUCKET = "premium-media";

/**
 * Every bucket in this project is private: files are only reachable through
 * short-lived signed URLs, so knowing a storage path is never enough to read
 * exclusive content. Access is enforced by storage policies.
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 60 * 30) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function uploadUserFile(params: {
  bucket: string;
  userId: string;
  file: File;
  folder?: string;
}) {
  const { bucket, userId, file, folder } = params;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = [userId, folder, `${crypto.randomUUID()}.${ext}`].filter(Boolean).join("/");
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}
