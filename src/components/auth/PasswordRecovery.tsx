import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export function PasswordRecovery() {
  const [method, setMethod] = useState<"email" | "phone">("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function recoverByEmail() {
    if (!email) {
      setMessage("Informe seu e-mail.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      setMessage("Link de recuperação enviado para seu e-mail.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar recuperação.");
    } finally {
      setLoading(false);
    }
  }

  async function recoverByPhone() {
    if (!phone) {
      setMessage("Informe seu telefone.");
      return;
    }

    setMessage("A recuperação por SMS será ativada após configurar o provedor de SMS.");
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <h3 className="font-semibold">Recuperar senha</h3>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={method === "email" ? "default" : "outline"}
          onClick={() => setMethod("email")}
        >
          E-mail
        </Button>

        <Button
          type="button"
          variant={method === "phone" ? "default" : "outline"}
          onClick={() => setMethod("phone")}
        >
          Telefone
        </Button>
      </div>

      {method === "email" && (
        <>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button disabled={loading} onClick={() => void recoverByEmail()}>
            {loading ? "Enviando..." : "Enviar link"}
          </Button>
        </>
      )}

      {method === "phone" && (
        <>
          <Input
            placeholder="+55 (79) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Button onClick={() => void recoverByPhone()}>Enviar código SMS</Button>
        </>
      )}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
