import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";

export const Route = createFileRoute("/messages")({ component: MessagesRoute });

type Conversation = {
  id: string;
  creator_id: string;
  subscriber_id: string;
  last_message_at: string | null;
  creator?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
};
type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
};

function MessagesRoute() {
  const { data: current } = useCurrentUser();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <RoleGate allowed={["subscriber", "creator"]}>
      <AppShell title="Mensagens">
        <MessagesWorkspace
          currentId={current?.user.id}
          selected={selected}
          onSelect={setSelected}
        />
      </AppShell>
    </RoleGate>
  );
}

function MessagesWorkspace({
  currentId,
  selected,
  onSelect,
}: {
  currentId?: string | undefined;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const conversations = useQuery({
    queryKey: ["messages-conversations", currentId],
    enabled: Boolean(currentId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          "id,creator_id,subscriber_id,last_message_at,profiles:creator_id(username,display_name,avatar_url)",
        )
        .or(`creator_id.eq.${currentId},subscriber_id.eq.${currentId}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Conversation[];
    },
  });
  useEffect(() => {
    if (!selected && conversations.data?.[0]) onSelect(conversations.data[0].id);
  }, [selected, conversations.data, onSelect]);
  if (conversations.isLoading) return <LoadingBlock />;
  if (conversations.error) return <ErrorBlock />;
  if (!conversations.data?.length)
    return (
      <EmptyBlock
        title="Nenhuma conversa ainda"
        description="Suas conversas com criadores aparecerão aqui."
        icon={<MessageCircle className="size-5" />}
      />
    );
  const active = conversations.data.find((c) => c.id === selected);

  if (!active) {
    return (
      <EmptyBlock
        title="Nenhuma conversa selecionada"
        description="Selecione uma conversa para continuar."
      />
    );
  }
  return (
    <div className="grid min-h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[280px_1fr]">
      <aside
        className={selected ? "hidden border-r border-border md:block" : "border-r border-border"}
      >
        <div className="border-b border-border p-4 font-semibold">Conversas</div>
        <div className="divide-y divide-border">
          {conversations.data.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/60 ${active.id === c.id ? "bg-secondary/60" : ""}`}
            >
              <UserAvatar
                name={c.creator?.display_name}
                path={c.creator?.avatar_url}
                className="size-10 shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {c.creator?.display_name ?? "Conversa"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.last_message_at
                    ? new Date(c.last_message_at).toLocaleDateString()
                    : "Nova conversa"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <Chat conversation={active} currentId={currentId!} onBack={() => onSelect(null)} />
    </div>
  );
}

function Chat({
  conversation,
  currentId,
  onBack,
}: {
  conversation: Conversation;
  currentId: string;
  onBack: () => void;
}) {
  const client = useQueryClient();
  const [body, setBody] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const messages = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,conversation_id,sender_id,body,created_at,read_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Message[];
    },
  });
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          client.setQueryData<Message[]>(["messages", conversation.id], (old) => [
            ...(old ?? []),
            payload.new as Message,
          ]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, client]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);
  async function send() {
    const text = body.trim();
    if (!text) return;
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversation.id, sender_id: currentId, body: text });
    if (!error) {
      setBody("");
      client.invalidateQueries({ queryKey: ["messages-conversations", currentId] });
    }
  }
  return (
    <section className="flex min-h-[calc(100vh-9rem)] min-w-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <UserAvatar
          name={conversation.creator?.display_name}
          path={conversation.creator?.avatar_url}
          className="size-10"
        />
        <div>
          <p className="font-semibold">{conversation.creator?.display_name ?? "Conversa"}</p>
          <p className="text-xs text-muted-foreground">Mensagens privadas</p>
        </div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.isLoading ? (
          <LoadingBlock />
        ) : messages.error ? (
          <ErrorBlock />
        ) : (
          messages.data?.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === currentId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${m.sender_id === currentId ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${m.sender_id === currentId ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.sender_id === currentId && m.read_at ? " · Lido" : ""}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottom} />
      </div>
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Escreva uma mensagem…"
            maxLength={5000}
            className="min-h-11 max-h-32 resize-none"
          />
          <Button size="icon" onClick={send} disabled={!body.trim()} aria-label="Enviar">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Enter envia · Shift+Enter quebra linha
        </p>
      </div>
    </section>
  );
}
