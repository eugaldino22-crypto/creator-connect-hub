import { useEffect, useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { getProtectedImageUrl } from "@/lib/media/images";
import {
  createWatermarkLabel,
  getWatermarkClassName,
  getWatermarkStyle,
} from "@/lib/media/watermark";

type ProtectedImageProps = {
  bucket: string;
  path: string;
  alt: string;
  viewerLabel?: string;
  sessionId?: string;
  premium?: boolean;
  className?: string;
  watermark?: boolean;
};

export function ProtectedImage({
  bucket,
  path,
  alt,
  viewerLabel = "Usuário",
  sessionId,
  premium = false,
  className = "",
  watermark = premium,
}: ProtectedImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setUrl(null);

    getProtectedImageUrl({
      bucket,
      path,
      expiresIn: 300,
    })
      .then((signedUrl) => {
        if (active) {
          setUrl(signedUrl);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [bucket, path]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-secondary/40 ${className}`}>
        <ImageOff className="size-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={url}
        alt={alt}
        draggable={false}
        className="h-full w-full select-none object-cover"
        onContextMenu={(event) => event.preventDefault()}
      />

      {watermark ? (
        <div className={getWatermarkClassName("bottom-right")} style={getWatermarkStyle(0.58)}>
          <span className="rounded-md bg-black/35 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {createWatermarkLabel(viewerLabel, sessionId)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
