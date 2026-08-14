import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { UserAvatar } from "@/components/common/UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";

export const Route = createFileRoute("/studio/messages")({ component: CreatorMessages });

type Conversation = {
  id: string;
  subscriber_id: string;
  last_message_at: string | null;
  profile: { display_name: string | null; avatar_url: string | null } | null;
};

function CreatorMessages() {
  const { data: current } = useCurrentUser();
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["creator-messages", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,subscriber_id,last_message_at,profile:subscriber_id(display_name,avatar_url)")
        .eq("creator_id", current!.user.id)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Conversation[];
    },
  });

  useEffect(() => {
    if (!selected && query.data?.[0]) setSelected(query.data[0].id);
  }, [selected, query.data]);

  return (
    <RoleGate allowed={["creator"]}>
      <AppShell title="Mensagens">
        {query.isLoading ? (
          <LoadingBlock />
        ) : query.error ? (
          <ErrorBlock />
        ) : !query.data?.length ? (
          <EmptyBlock
            title="Nenhuma mensagem ainda"
            description="As mensagens dos seus assinantes aparecerão aqui."
            icon={<MessageCircle className="size-5" />}
          />
        ) : (
          <div className="grid min-h-[500px] overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[300px_1fr]">
            <aside className="border-r border-border">
              <div className="border-b border-border p-4 font-semibold">Seus assinantes</div>
              {query.data.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelected(conversation.id)}
                  className={`flex w-full items-center gap-3 border-b border-border p-4 text-left ${selected === conversation.id ? "bg-secondary" : "hover:bg-secondary/60"}`}
                >
                  <UserAvatar
                    name={conversation.profile?.display_name}
                    path={conversation.profile?.avatar_url}
                    className="size-10"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {conversation.profile?.display_name ?? "Assinante"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.last_message_at
                        ? new Date(conversation.last_message_at).toLocaleDateString("pt-BR")
                        : "Nova conversa"}
                    </p>
                  </div>
                </button>
              ))}
            </aside>
            <div className="flex items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Selecione uma conversa para abrir as mensagens.
            </div>
          </div>
        )}
      </AppShell>
    </RoleGate>
  );
}
