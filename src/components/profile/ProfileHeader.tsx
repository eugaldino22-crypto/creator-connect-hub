import { Camera } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";

type Props = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  avatar?: string | null | undefined;
  loading?: boolean;
  onChangeAvatar?: () => void;
};

export function ProfileHeader({ name, email, avatar, loading, onChangeAvatar }: Props) {
  return (
    <div className="settings-card flex items-center gap-5 p-6">
      <div className="relative">
        <UserAvatar name={name} path={avatar} className="size-24" />

        <button
          onClick={onChangeAvatar}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">{name ?? "Usuário"}</h2>

        <p className="text-sm text-muted-foreground">{email}</p>

        <Button className="mt-3" disabled={loading} onClick={onChangeAvatar}>
          {loading ? "Enviando..." : "Alterar foto"}
        </Button>
      </div>
    </div>
  );
}
