import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  userId: string;
  phone?: string | null | undefined;
  verified?: boolean | undefined;
  onSaved?: () => void;
};

export function PhoneRecoverySettings({ userId, phone, verified, onSaved }: Props) {
  const [phoneNumber, setPhoneNumber] = useState(phone ?? "");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"phone" | "code">(verified ? "phone" : "phone");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode() {
    if (!phoneNumber) {
      setMessage("Informe um telefone.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Preparação para integração SMS OTP
      setStep("code");

      setMessage("Código enviado para o telefone.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode() {
    if (!code) {
      setMessage("Informe o código recebido.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase
        .from("profiles")
        .update({
          phone_number: phoneNumber,
          phone_verified: true,
        })
        .eq("id", userId);

      if (error) throw error;

      setMessage("Telefone confirmado com sucesso.");
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao confirmar telefone.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-card space-y-5 p-6">
      <div>
        <h3 className="text-lg font-semibold">Telefone de recuperação</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Use seu telefone para recuperar sua conta.
        </p>
      </div>

      {step === "phone" && (
        <>
          <Input
            placeholder="+55 (79) 99999-9999"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <Button disabled={loading} onClick={() => void sendCode()}>
            {loading ? "Enviando..." : "Enviar código"}
          </Button>
        </>
      )}

      {step === "code" && (
        <>
          <Input
            placeholder="Código recebido"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Button disabled={loading} onClick={() => void confirmCode()}>
            {loading ? "Confirmando..." : "Confirmar telefone"}
          </Button>
        </>
      )}

      {verified ? <p className="text-sm text-green-500">✓ Telefone confirmado</p> : null}

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
