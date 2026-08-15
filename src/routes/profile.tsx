import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/auth/RoleGate";
import { useCurrentUser } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_BUCKET, uploadUserFile } from "@/lib/media";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { PasswordSettings } from "@/components/profile/PasswordSettings";
import { PhoneRecoverySettings } from "@/components/profile/PhoneRecoverySettings";
import { DangerZone } from "@/components/profile/DangerZone";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data, refetch } = useCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadAvatar(file: File) {
    if (!data?.user) return;

    try {
      setLoading(true);
      setMessage("");

      const path = await uploadUserFile({
        bucket: PUBLIC_BUCKET,
        userId: data.user.id,
        file,
        folder: "avatar",
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: path,
        })
        .eq("id", data.user.id);

      if (error) throw error;

      await refetch();

      setMessage("Foto atualizada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar foto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGate allowed={["subscriber", "creator", "admin", "super_admin"]}>
      <AppShell title="Meu perfil">
        <div className="space-y-5">
          <ProfileHeader
            name={data?.profile?.display_name}
            email={data?.user.email}
            avatar={data?.profile?.avatar_url}
            loading={loading}
            onChangeAvatar={() => inputRef.current?.click()}
          />

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void uploadAvatar(file);
              }
            }}
          />

          <AccountSettings
            name={data?.profile?.display_name}
            username={data?.profile?.username}
            bio={data?.profile?.bio}
            onSave={async (values) => {
              if (!data?.user) return;

              const { error } = await supabase
                .from("profiles")
                .update({
                  display_name: values.display_name,
                  username: values.username,
                  bio: values.bio,
                })
                .eq("id", data.user.id);

              if (error) throw error;

              await refetch();
            }}
          />

          <PasswordSettings />

          <PhoneRecoverySettings
            userId={data?.user.id ?? ""}
            phone={data?.profile?.phone_number}
            verified={data?.profile?.phone_verified}
            onSaved={() => void refetch()}
          />

          <DangerZone />

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </AppShell>
    </RoleGate>
  );
}
