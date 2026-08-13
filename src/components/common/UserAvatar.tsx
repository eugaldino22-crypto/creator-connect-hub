import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSignedUrl, PUBLIC_BUCKET } from "@/lib/media";
import { initials } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function useStorageUrl(bucket: string, path?: string | null) {
  return useQuery({
    queryKey: ["storage-url", bucket, path],
    queryFn: () => (path ? getSignedUrl(bucket, path) : null),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 20,
  });
}

export function UserAvatar({
  name,
  path,
  className,
}: {
  name?: string | null;
  path?: string | null;
  className?: string;
}) {
  const { data: url } = useStorageUrl(PUBLIC_BUCKET, path);
  return (
    <Avatar className={cn("size-10 border border-border", className)}>
      {url ? <AvatarImage src={url} alt={name ?? "Avatar"} /> : null}
      <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}