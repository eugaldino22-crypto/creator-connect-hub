import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  name?: string | null | undefined;
  username?: string | null | undefined;
  bio?: string | null | undefined;
  onSave: (data: { display_name: string; username: string; bio: string }) => Promise<void>;
};

export function AccountSettings({ name, username, bio, onSave }: Props) {
  const [displayName, setDisplayName] = useState(name ?? "");
  const [userName, setUserName] = useState(username ?? "");
  const [description, setDescription] = useState(bio ?? "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    try {
      setLoading(true);
      setMessage("");

      await onSave({
        display_name: displayName,
        username: userName,
        bio: description,
      });

      setMessage("Informações atualizadas com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar informações.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-card space-y-5 p-6">
      <div>
        <h3 className="text-lg font-semibold">Informações pessoais</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Atualize seu nome, usuário e informações básicas.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome público</label>

          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Usuário</label>

          <Input value={userName} onChange={(e) => setUserName(e.target.value)} className="mt-2" />
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2"
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button disabled={loading} onClick={handleSave}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>

        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </section>
  );
}
