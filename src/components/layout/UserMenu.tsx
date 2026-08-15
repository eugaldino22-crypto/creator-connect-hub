import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

export function UserMenu() {
  const { data } = useCurrentUser();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="flex items-center gap-2 rounded-xl"
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          name={data?.profile?.display_name}
          path={data?.profile?.avatar_url}
          className="size-9"
        />
        <ChevronDown className="size-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-popover p-2 shadow-xl">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-secondary"
          >
            <UserRound className="size-4" />
            Meu perfil
          </Link>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-secondary"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
