import { Button } from "@/components/ui/button";

export function DangerZone() {
  function deleteAccount() {
    const confirm = window.confirm(
      "Tem certeza que deseja encerrar sua conta? Essa ação não pode ser desfeita.",
    );

    if (!confirm) return;

    alert("Solicitação de encerramento enviada.");
  }

  return (
    <section className="settings-card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-red-500">Zona de perigo</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Encerrar sua conta removerá seu acesso à plataforma. Essa ação não poderá ser desfeita.
        </p>
      </div>

      <Button variant="destructive" onClick={deleteAccount}>
        Encerrar conta
      </Button>
    </section>
  );
}
