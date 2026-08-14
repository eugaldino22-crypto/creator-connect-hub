import { useEffect, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";

export function FollowButton({ creatorId }: { creatorId: string }) {
  const { data: current } = useCurrentUser();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!current?.user.id || current.user.id === creatorId) return;
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", current.user.id)
      .eq("creator_id", creatorId)
      .maybeSingle()
      .then(({ data }) => setFollowing(Boolean(data)));
  }, [current?.user.id, creatorId]);
  if (!current?.user.id || current.user.id === creatorId) return null;
  async function toggle() {
    if (busy) return;
    setBusy(true);
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", current!.user.id)
        .eq("creator_id", creatorId);
      if (!error) setFollowing(false);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: current!.user.id, creator_id: creatorId });
      if (!error) setFollowing(true);
    }
    setBusy(false);
  }
  return (
    <Button
      variant={following ? "secondary" : "default"}
      onClick={toggle}
      disabled={busy}
      className="gap-2"
    >
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? "Seguindo" : "Seguir"}
    </Button>
  );
}
