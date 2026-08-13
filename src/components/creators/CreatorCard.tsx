import { Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { UserAvatar, useStorageUrl } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { PUBLIC_BUCKET } from "@/lib/media";
import { formatCents } from "@/lib/brand";

export type CreatorSummary = {
  user_id: string;
  headline: string | null;
  category: string | null;
  is_verified: boolean;
  profile: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    cover_url: string | null;
  } | null;
  cheapest_plan_cents?: number | null;
  currency?: string;
};

export function CreatorCard({ creator }: { creator: CreatorSummary }) {
  const { data: coverUrl } = useStorageUrl(PUBLIC_BUCKET, creator.profile?.cover_url);
  const username = creator.profile?.username;

  return (
    <Link
      to="/c/$username"
      params={{ username: username ?? creator.user_id }}
      className="surface-card group block overflow-hidden transition-transform hover:-translate-y-0.5"
    >
      <div className="relative h-28 bg-secondary">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="size-full bg-brand-gradient opacity-30" />
        )}
      </div>
      <div className="-mt-7 px-4 pb-4">
        <UserAvatar
          name={creator.profile?.display_name}
          path={creator.profile?.avatar_url}
          className="size-14 ring-2 ring-card"
        />
        <div className="mt-3 flex items-center gap-1.5">
          <p className="truncate font-semibold">{creator.profile?.display_name ?? "Criador"}</p>
          {creator.is_verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
        </div>
        {username ? <p className="text-xs text-muted-foreground">@{username}</p> : null}
        <p className="mt-2 line-clamp-2 min-h-9 text-sm text-muted-foreground">
          {creator.headline ?? "Este criador ainda não escreveu uma descrição."}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          {creator.category ? <Badge variant="secondary">{creator.category}</Badge> : <span />}
          <span className="text-xs text-muted-foreground">
            {creator.cheapest_plan_cents != null
              ? `de ${formatCents(creator.cheapest_plan_cents, creator.currency)}/mês`
              : "Sem plano publicado"}
          </span>
        </div>
      </div>
    </Link>
  );
}