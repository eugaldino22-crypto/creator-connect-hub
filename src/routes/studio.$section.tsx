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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-session";
import { createVideoCall } from "@/lib/video-calls";
import { VideoCallPanel } from "@/components/video/VideoCallPanel";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PREMIUM_BUCKET, PUBLIC_BUCKET } from "@/lib/media";
import { uploadPostImage } from "@/lib/media/images";
import { FinanceDashboard } from "@/components/studio/FinanceDashboard";
import { formatCents } from "@/lib/brand";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0].value;

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

  if (section === "calls") {
    return (
      <RoleGate allowed={["creator"]}>
        <CallsManager />
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
  const isPlans = section === "plans";

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planCurrency, setPlanCurrency] = useState(DEFAULT_CURRENCY);
  const [planInterval, setPlanInterval] = useState("1");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const table: StudioTable =
    section === "posts" ? "posts" : section === "plans" ? "subscription_plans" : "creator_profiles";

  const q = useQuery({
    queryKey: ["studio", table, user?.user.id],
    enabled: Boolean(user?.user.id),
    queryFn: async (): Promise<StudioRow[]> => {
      if (!user?.user.id) return [];

      const column = table === "subscription_plans" ? "creator_id" : "user_id";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(column, user.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data ?? []) as StudioRow[];
    },
  });

  function resetPlanForm() {
    setPlanName("");
    setPlanDescription("");
    setPlanPrice("");
    setPlanCurrency(DEFAULT_CURRENCY);
    setPlanInterval("1");
    setEditingId(null);
    setFormError("");
  }

  function startEdit(row: StudioRow) {
    setEditingId(row.id);
    setPlanName(row.name ?? "");
    setPlanDescription("");
    setPlanPrice(typeof row.price_cents === "number" ? (row.price_cents / 100).toFixed(2) : "");
    setPlanCurrency(row.currency ?? DEFAULT_CURRENCY);
    setPlanInterval(typeof row.interval_months === "number" ? String(row.interval_months) : "1");
    setFormError("");
  }

  async function savePlan() {
    if (!user?.user.id) return;

    const name = planName.trim();
    const price = Number(planPrice.replace(",", "."));
    const interval = Number.parseInt(planInterval, 10);

    if (!name) {
      setFormError("Informe o nome do plano.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(interval) || interval < 1) {
      setFormError("O intervalo deve ser de pelo menos 1 m\u00EAs.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name,
        description: planDescription.trim() || null,
        price_cents: Math.round(price * 100),
        currency: planCurrency.toUpperCase().slice(0, 3),
        interval_months: interval,
        is_active: true,
      };

      if (editingId) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(payload)
          .eq("id", editingId)
          .eq("creator_id", user.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscription_plans").insert({
          ...payload,
          creator_id: user.user.id,
        });

        if (error) throw error;
      }

      await q.refetch();
      resetPlanForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o plano.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(row: StudioRow) {
    if (!user?.user.id || row.is_active === undefined) return;

    const { error } = await supabase
      .from("subscription_plans")
      .update({ is_active: !row.is_active })
      .eq("id", row.id)
      .eq("creator_id", user.user.id);

    if (error) {
      setFormError(error.message);
      return;
    }

    await q.refetch();
  }

  async function deletePlan(row: StudioRow) {
    if (!user?.user.id) return;

    const confirmed = window.confirm(
      "Excluir este plano? Assinaturas existentes não serão reativadas.",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", row.id)
      .eq("creator_id", user.user.id);

    if (error) {
      setFormError(error.message);
      return;
    }

    if (editingId === row.id) {
      resetPlanForm();
    }

    await q.refetch();
  }

  return (
    <AppShell title={isPlans ? "Studio \u00B7 Planos" : `Studio \u00B7 ${section}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold capitalize">{section}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPlans
              ? "Crie e gerencie seus planos de assinatura."
              : "Dados reais do seu espaço de criador."}
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

      {isPlans ? (
        <div className="mt-6 surface-card space-y-4 p-5">
          <div>
            <h3 className="text-lg font-semibold">{editingId ? "Editar plano" : "Novo plano"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              O plano ficará disponível para assinantes quando estiver ativo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Nome do plano"
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
            />

            <Input
              placeholder="Preço"
              inputMode="decimal"
              value={planPrice}
              onChange={(event) => setPlanPrice(event.target.value)}
            />

            <Select value={planCurrency} onValueChange={setPlanCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a moeda" />
              </SelectTrigger>

              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Intervalo em meses"
              inputMode="numeric"
              value={planInterval}
              onChange={(event) => setPlanInterval(event.target.value)}
            />

            <Textarea
              placeholder="Descrição do plano"
              className="md:col-span-2"
              value={planDescription}
              onChange={(event) => setPlanDescription(event.target.value)}
            />
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} onClick={() => void savePlan()}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar plano"}
            </Button>

            {editingId ? (
              <Button variant="outline" onClick={resetPlanForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

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
            description={
              isPlans
                ? "Crie seu primeiro plano de assinatura."
                : "Comece configurando seu perfil e publicando conte\u00FAdo."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  {isPlans ? (
                    <>
                      <th className="px-4 py-3">Preço</th>
                      <th className="px-4 py-3">Intervalo</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Ações</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Data</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {q.data.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-4 py-3 font-medium">{row.name ?? row.title ?? row.id}</td>

                    {isPlans ? (
                      <>
                        <td className="px-4 py-3">
                          {typeof row.price_cents === "number"
                            ? formatCents(row.price_cents, row.currency ?? DEFAULT_CURRENCY)
                            : "\u2014"}
                        </td>

                        <td className="px-4 py-3">
                          {typeof row.interval_months === "number"
                            ? `${row.interval_months} m\u00EAs${row.interval_months === 1 ? "" : "es"}`
                            : "\u2014"}
                        </td>

                        <td className="px-4 py-3">{row.is_active ? "Ativo" : "Inativo"}</td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void togglePlan(row)}
                            >
                              {row.is_active ? "Desativar" : "Ativar"}
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void deletePlan(row)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          {row.status ?? (row.is_active ? "Ativo" : "\u2014")}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString("pt-BR")
                            : "\u2014"}
                        </td>
                      </>
                    )}
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

  const q = useQuery({
    queryKey: ["studio-subscribers", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async (): Promise<SubscriberRow[]> => {
      if (!current?.user.id) return [];

      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id,subscriber_id,status,current_period_end,profiles:subscriber_id(username,display_name,avatar_url)",
        )
        .eq("creator_id", current.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as SubscriberRow[];
    },
  });

  return (
    <AppShell title="Studio · Assinantes">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Assinantes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie sua comunidade e acompanhe seus assinantes ativos.
          </p>
        </div>
        <Users className="size-7 text-primary" />
      </div>

      <div className="mt-6 grid gap-3">
        {q.isLoading ? (
          <LoadingBlock />
        ) : q.error ? (
          <EmptyBlock
            title="Não foi possível carregar os assinantes"
            description="Verifique as permissões da conta."
          />
        ) : !q.data?.length ? (
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
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

function CallsManager() {
  const { data: current } = useCurrentUser();
  const [callId, setCallId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const [callError, setCallError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["studio-call-subscribers", current?.user.id],
    enabled: Boolean(current?.user.id),
    queryFn: async (): Promise<SubscriberRow[]> => {
      if (!current?.user.id) return [];

      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "id,subscriber_id,status,current_period_end,profiles:subscriber_id(username,display_name,avatar_url)",
        )
        .eq("creator_id", current.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

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
    <AppShell title="Studio · Chamadas">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Chamadas</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Inicie videochamadas individuais com seus assinantes ativos.
          </p>
        </div>

        <Video className="size-7 text-primary" />
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
        ) : !q.data?.length ? (
          <EmptyBlock
            title="Nenhum assinante disponível"
            description="Quando você tiver assinantes ativos, poderá iniciar chamadas com eles aqui."
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
        if (file.type.startsWith("image/")) {
          const media = await uploadPostImage({
            postId: post.id,
            userId: data.user.id,
            file,
            premium: exclusive,
            position,
          });

          uploaded.push({
            bucket: media.bucket,
            path: media.storagePath,
            file,
            position,
          });
        } else {
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
      }

      const uploadedVideos = uploaded.filter((item) => item.file.type.startsWith("video/"));

      if (uploadedVideos.length) {
        const { error: mediaError } = await supabase.from("post_media").insert(
          uploadedVideos.map((item) => ({
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
