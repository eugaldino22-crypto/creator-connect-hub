import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_BUCKET, PREMIUM_BUCKET, getSignedUrl, uploadUserFile } from "@/lib/media";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadedPostImage = {
  id: string;
  postId: string;
  bucket: string;
  storagePath: string;
  mediaType: "image";
  isPrivate: boolean;
};

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: "Formato de imagem não permitido.",
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: "A imagem deve ter no máximo 15 MB.",
    };
  }

  return {
    valid: true,
  };
}

export async function uploadPostImage(params: {
  postId: string;
  userId: string;
  file: File;
  premium?: boolean;
  position?: number;
  width?: number | null;
  height?: number | null;
}) {
  const validation = validateImageFile(params.file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const bucket = params.premium ? PREMIUM_BUCKET : PUBLIC_BUCKET;

  const storagePath = await uploadUserFile({
    bucket,
    userId: params.userId,
    file: params.file,
    folder: `posts/${params.postId}`,
  });

  const { data, error } = await supabase
    .from("post_media")
    .insert({
      post_id: params.postId,
      creator_id: params.userId,
      bucket,
      storage_path: storagePath,
      media_type: "image",
      is_private: Boolean(params.premium),
      position: params.position ?? 0,
      width: params.width ?? null,
      height: params.height ?? null,
    })
    .select("id,post_id,bucket,storage_path,media_type,is_private")
    .single();

  if (error) {
    await supabase.storage.from(bucket).remove([storagePath]);
    throw error;
  }

  return {
    id: data.id,
    postId: data.post_id,
    bucket: data.bucket,
    storagePath: data.storage_path,
    mediaType: "image",
    isPrivate: data.is_private,
  } satisfies UploadedPostImage;
}

export async function getProtectedImageUrl(params: {
  bucket: string;
  path: string;
  expiresIn?: number;
}) {
  return getSignedUrl(params.bucket, params.path, params.expiresIn ?? 300);
}

export async function getPostImageUrl(params: {
  postId: string;
  mediaId: string;
  expiresIn?: number;
}) {
  const { data, error } = await supabase
    .from("post_media")
    .select("id,post_id,bucket,storage_path,media_type")
    .eq("id", params.mediaId)
    .eq("post_id", params.postId)
    .eq("media_type", "image")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return getProtectedImageUrl({
    bucket: data.bucket,
    path: data.storage_path,
    ...(params.expiresIn ? { expiresIn: params.expiresIn } : {}),
  });
}

export async function deletePostImage(params: { postId: string; mediaId: string; userId: string }) {
  const { data, error } = await supabase
    .from("post_media")
    .select("id,bucket,storage_path,creator_id,post_id,media_type")
    .eq("id", params.mediaId)
    .eq("post_id", params.postId)
    .eq("creator_id", params.userId)
    .eq("media_type", "image")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Imagem não encontrada.");
  }

  const { error: storageError } = await supabase.storage
    .from(data.bucket)
    .remove([data.storage_path]);

  if (storageError) {
    throw storageError;
  }

  const { error: deleteError } = await supabase
    .from("post_media")
    .delete()
    .eq("id", data.id)
    .eq("creator_id", params.userId);

  if (deleteError) {
    throw deleteError;
  }
}

export type PostMediaRecord = {
  id: string;
  post_id: string;
  creator_id: string;
  bucket: string;
  storage_path: string;
  media_type: string;
  is_private: boolean;
  position: number;
  width: number | null;
  height: number | null;
};

export async function getPostMedia(mediaId: string) {
  const { data, error } = await supabase
    .from("post_media")
    .select("id,post_id,creator_id,bucket,storage_path,media_type,is_private,position,width,height")
    .eq("id", mediaId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as PostMediaRecord | null;
}

export async function getPostMediaUrl(mediaId: string, expiresIn = 300) {
  const media = await getPostMedia(mediaId);

  if (!media || media.media_type !== "image") {
    return null;
  }

  const url = await getProtectedImageUrl({
    bucket: media.bucket,
    path: media.storage_path,
    expiresIn,
  });

  return {
    media,
    url,
  };
}
