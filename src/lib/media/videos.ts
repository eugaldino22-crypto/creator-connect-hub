export type VideoUploadResult = {
  provider: "cloudflare-stream";
  assetId: string;
  playbackId?: string | null;
};

export type VideoPlaybackToken = {
  provider: "cloudflare-stream";
  token: string;
  expiresAt: string;
};

export type VideoAccessResult = {
  allowed: boolean;
  reason?: string;
};

export function validateVideoFile(file: File) {
  const allowedTypes = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);

  const maxBytes = 200 * 1024 * 1024;

  if (!allowedTypes.has(file.type)) {
    return {
      valid: false,
      error: "Formato de vídeo não permitido.",
    };
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: "O vídeo deve ter no máximo 200 MB.",
    };
  }

  return {
    valid: true,
  };
}

/**
 * A implementação do upload será feita server-side.
 *
 * Não colocamos API keys, tokens ou secrets do provedor
 * dentro deste arquivo ou no navegador.
 */
export async function uploadVideo(_params: {
  file: File;
  creatorId: string;
  premium?: boolean;
}): Promise<VideoUploadResult> {
  throw new Error(
    "Upload de vídeo ainda não configurado. Configure o provedor de vídeo no backend.",
  );
}

/**
 * Retorna um token temporário de reprodução.
 *
 * A geração do token deve ocorrer no backend/Edge Function.
 */
export async function getVideoPlaybackToken(_assetId: string): Promise<VideoPlaybackToken> {
  throw new Error(
    "Playback de vídeo ainda não configurado. Configure o token de reprodução no backend.",
  );
}

/**
 * Verifica se o usuário pode assistir ao vídeo.
 *
 * A autorização final deve ser feita no backend antes
 * da emissão do token de playback.
 */
export async function canAccessVideo(
  _assetId: string,
  _userId: string,
): Promise<VideoAccessResult> {
  throw new Error("Controle de acesso de vídeo ainda não configurado no backend.");
}
