import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Video, Users, Upload, X, Image as ImageIcon } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { createVideoCall } from "@/lib/video-calls";
import { VideoCallPanel } from "@/components/video/VideoCallPanel";
import { UserAvatar } from "@/components/common/UserAvatar";
import { uploadUserFile, PUBLIC_BUCKET, PREMIUM_BUCKET } from "@/lib/media";
import { FinanceDashboard } from "@/components/studio/FinanceDashboard";

type StudioTable = "posts" | "subscription_plans" | "creator_profiles";

type StudioRow = {
  id: string;
  status?: string | null;
  name?: string | null;
  title?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type SubscriberProfile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type SubscriberRow = {
  id: string;
  subscriber_id: string;
  status: string;
  current_period_end: string | null;
  profiles: SubscriberProfile | null;
};

export const Route = createFileRoute("/studio/$section")({
  component: StudioSection,
});

function StudioSection() {
  const { section } = Route.useParams();

  if (section === "new") {
    return (
      <RoleGate allowed={["creator"]}>
        <CreatePost />
      </RoleGate>
    );
  }

  if (section === "subscribers") {
    return (
      <RoleGate allowed={["creator"]}>
        <SubscriberManager />
      </RoleGate>
    );
  }

  if (section === "finance") {
    return (
      <RoleGate allowed={["creator"]}>
        <AppShell title="Studio · Financeiro">
          <FinanceDashboard />
        </AppShell>
      </RoleGate>
    );
  }

  return (
    <RoleGate allowed={["creator"]}>
      <StudioTableSection section={section} />
    </RoleGate>
  );
}

function StudioTableSection({ section }: { section: string }) {
  const { data: user } = useCurrentUser();

  const table: StudioTable =
    section === "posts" ? "posts" : section === "plans" ? "subscription_plans" : "creator_profiles";

  const q = useQuery({
    queryKey: ["studio", table, user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async (): Promise<StudioRow[]> => {
      if (!user?.user.id) {
        return [];
      }

      const column = table === "subscription_plans" ? "creator_id" : "user_id";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(column, user.user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(50);

      if (error) {
        throw error;
      }

      return (data ?? []) as StudioRow[];
    },
  });

  return (
    <AppShell title={`Studio · ${section}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold capitalize">{section}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Dados reais do seu espaço de criador.
          </p>
        </div>

        {section === "posts" ? (
          <Button asChild>
            <Link to="/studio/$section" params={{ section: "new" }}>
              Nova publicação
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-6 surface-card overflow-hidden">
        {q.isLoading ? (
          <LoadingBlock />
        ) : q.error ? (
          <EmptyBlock
            title="Não foi possível carregar"
            description="Verifique as permissões da conta."
          />
        ) : q.data?.length === 0 ? (
          <EmptyBlock
            title="Nada aqui ainda"
            description="Comece configurando seu perfil e publicando conteúdo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>

              <tbody>
                {q.data.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-mono text-xs">{row.id}</td>

                    <td className="px-4 py-3">
                      {row.status ?? row.name ?? row.title ?? (row.is_active ? "Ativo" : "—")}
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SubscriberManager() {
  const { data: current } = useCurrentUser();
  const [callId, setCallId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["studio-subscribers", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async (): Promise<SubscriberRow[]> => {
      if (!current?.user.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id,subscriber_id,status,current_period_end,profiles:subscriber_id(username,display_name,avatar_url)",
        )
        .eq("creator_id", current.user.id)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return (data ?? []) as SubscriberRow[];
    },
  });

  async function startCall(subscriberId: string) {
    setStarting(subscriberId);
    setCallError(null);

    try {
      const result = await createVideoCall(subscriberId);

      setCallId(result.call.id);
      setCallOpen(true);
    } catch (error) {
      setCallError(error instanceof Error ? error.message : "Não foi possível iniciar a chamada.");
    } finally {
      setStarting(null);
    }
  }

  return (
    <AppShell title="Studio · Assinantes">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Assinantes</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie sua comunidade e inicie videochamadas individuais com assinantes ativos.
          </p>
        </div>

        <Users className="size-7 text-primary" />
      </div>

      {callError ? (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {callError}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {q.isLoading ? (
          <LoadingBlock />
        ) : q.error ? (
          <EmptyBlock
            title="Não foi possível carregar os assinantes"
            description="Verifique as permissões da conta."
          />
        ) : q.data?.length === 0 ? (
          <EmptyBlock
            title="Nenhum assinante ativo"
            description="Quando uma assinatura for confirmada, o assinante aparecerá aqui."
          />
        ) : (
          q.data.map((subscriber) => (
            <div
              key={subscriber.id}
              className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <UserAvatar
                name={subscriber.profiles?.display_name}
                path={subscriber.profiles?.avatar_url}
                className="size-11"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold">{subscriber.profiles?.display_name ?? "Assinante"}</p>

                <p className="text-sm text-muted-foreground">
                  {subscriber.profiles?.username
                    ? `@${subscriber.profiles.username}`
                    : "Assinante ativo"}
                </p>
              </div>

              <Button
                className="gap-2"
                disabled={starting === subscriber.subscriber_id}
                onClick={() => void startCall(subscriber.subscriber_id)}
              >
                <Video className="size-4" />

                {starting === subscriber.subscriber_id ? "Conectando…" : "Fazer videochamada"}
              </Button>
            </div>
          ))
        )}
      </div>

      <VideoCallPanel callId={callId} open={callOpen} onClose={() => setCallOpen(false)} />
    </AppShell>
  );
}

function CreatePost() {
  const { data } = useCurrentUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [exclusive, setExclusive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function addFiles(list: FileList | null) {
    if (!list) {
      return;
    }

    const accepted = Array.from(list).filter((file) => {
      const validType = file.type.startsWith("image/") || file.type.startsWith("video/");

      const maxBytes = file.type.startsWith("video/") ? 200 * 1024 * 1024 : 15 * 1024 * 1024;

      return validType && file.size <= maxBytes;
    });

    setFiles((current) => [...current, ...accepted].slice(0, 10));

    setError(
      accepted.length !== list.length
        ? "Alguns arquivos foram ignorados. Imagens: até 15 MB; vídeos: até 200 MB."
        : "",
    );
  }

  async function publish() {
    if (!data?.user.id || (!title.trim() && !body.trim() && !files.length)) {
      return;
    }

    setBusy(true);
    setError("");
    setSaved(false);

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        creator_id: data.user.id,
        title: title.trim() || null,
        body: body.trim() || null,
        visibility: exclusive ? "subscribers" : "public",
        is_published: true,
      })
      .select("id")
      .single();

    if (postError || !post) {
      setError(postError?.message ?? "Não foi possível criar a publicação.");
      setBusy(false);
      return;
    }

    const uploaded: {
      bucket: string;
      path: string;
      file: File;
      position: number;
    }[] = [];

    try {
      for (const [position, file] of files.entries()) {
        const bucket = exclusive ? PREMIUM_BUCKET : PUBLIC_BUCKET;

        const path = await uploadUserFile({
          bucket,
          userId: data.user.id,
          file,
          folder: `posts/${post.id}`,
        });

        uploaded.push({
          bucket,
          path,
          file,
          position,
        });
      }

      if (uploaded.length) {
        const { error: mediaError } = await supabase.from("post_media").insert(
          uploaded.map((item) => ({
            post_id: post.id,
            creator_id: data.user.id,
            bucket: item.bucket,
            storage_path: item.path,
            media_type: item.file.type.startsWith("video/") ? "video" : "image",
            is_private: exclusive,
            position: item.position,
          })),
        );

        if (mediaError) {
          throw mediaError;
        }
      }

      setTitle("");
      setBody("");
      setFiles([]);
      setExclusive(false);
      setSaved(true);
    } catch (error) {
      if (uploaded.length) {
        await Promise.all(
          uploaded.map((item) => supabase.storage.from(item.bucket).remove([item.path])),
        );
      }

      await supabase.from("posts").delete().eq("id", post.id).eq("creator_id", data.user.id);

      setError(error instanceof Error ? error.message : "Não foi possível enviar a mídia.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Nova publicação">
      <div className="max-w-2xl space-y-4">
        <Input
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Textarea
          placeholder="Escreva para sua comunidade…"
          className="min-h-40"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground hover:bg-secondary/40">
          <Upload className="size-4" />
          Adicionar fotos ou vídeos
          <input
            className="sr-only"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>

        {files.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative overflow-hidden rounded-xl border border-border bg-secondary/30 p-2"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-background">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground" />
                  )}
                </div>

                <p className="mt-2 truncate text-xs">{file.name}</p>

                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1"
                  onClick={() =>
                    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
                  }
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={exclusive}
            onChange={(event) => setExclusive(event.target.checked)}
          />
          Somente assinantes
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button disabled={busy} onClick={() => void publish()}>
          {busy ? "Enviando…" : "Publicar"}
        </Button>

        {saved ? (
          <p className="text-sm text-muted-foreground">Publicação criada com sucesso.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
