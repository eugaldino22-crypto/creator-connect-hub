import { useQuery } from "@tanstack/react-query";
import { Phone, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { VideoCallPanel } from "@/components/video/VideoCallPanel";

type VideoCallProfile = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type IncomingCall = {
  id: string;
  creator_id: string;
  subscriber_id: string;
  status: string;
  created_at: string;
  profiles: VideoCallProfile | null;
};

export function IncomingVideoCallBanner() {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ["incoming-video-call", user?.user.id],
    enabled: Boolean(user?.user.id),
    refetchInterval: 5000,
    queryFn: async (): Promise<IncomingCall | null> => {
      const { data, error } = await supabase
        .from("video_calls")
        .select(
          "id,creator_id,subscriber_id,status,created_at,profiles:creator_id(display_name,username,avatar_url)",
        )
        .eq("subscriber_id", user!.user.id)
        .in("status", ["ringing", "active"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return (data ?? null) as IncomingCall | null;
    },
  });

  const call = query.data;

  if (!call || open) {
    return (
      <VideoCallPanel
        callId={open && call ? call.id : null}
        open={open && Boolean(call)}
        onClose={() => setOpen(false)}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-violet-400/20 bg-neutral-950 p-3 text-white shadow-2xl lg:bottom-6 lg:left-auto lg:right-6 lg:inset-x-auto">
        <UserAvatar
          name={call.profiles?.display_name}
          path={call.profiles?.avatar_url}
          className="size-11"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Chamada de vídeo recebida</p>

          <p className="truncate text-xs text-white/60">
            {call.profiles?.display_name ?? "Seu criador"} está chamando você.
          </p>
        </div>

        <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
          <Phone className="size-4" />
          Atender
        </Button>
      </div>

      <Video className="sr-only" />
    </>
  );
}
