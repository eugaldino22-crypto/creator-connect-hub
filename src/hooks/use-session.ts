import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "subscriber" | "creator" | "admin" | "super_admin";

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  onboarding_completed: boolean;
  is_suspended: boolean;
};

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async (): Promise<Session | null> => {
      const { data } = await supabase.auth.getSession();
      return data.session ?? null;
    },
    staleTime: 30_000,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, username, display_name, bio, avatar_url, cover_url, onboarding_completed, is_suspended",
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      return {
        user,
        profile: (profile ?? null) as Profile | null,
        roles: (roles ?? []).map((r) => r.role as AppRole),
      };
    },
    staleTime: 15_000,
  });
}

export function hasRole(roles: AppRole[] | undefined, role: AppRole) {
  return (roles ?? []).includes(role);
}

export function hasAnyRole(roles: AppRole[] | undefined, allowed: AppRole[]) {
  return allowed.some((role) => (roles ?? []).includes(role));
}
