import { supabase } from "@/integrations/supabase/client";

export type MediaAccess = {
  allowed: boolean;
  reason?: string;
};

export async function canAccessCreatorMedia(
  creatorId: string,
  userId: string,
): Promise<MediaAccess> {
  if (!creatorId || !userId) {
    return {
      allowed: false,
      reason: "Usuário não autenticado.",
    };
  }

  if (creatorId === userId) {
    return { allowed: true };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("id,current_period_end")
    .eq("creator_id", creatorId)
    .eq("subscriber_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return {
      allowed: false,
      reason: "Não foi possível validar a assinatura.",
    };
  }

  if (!data) {
    return {
      allowed: false,
      reason: "É necessária uma assinatura ativa.",
    };
  }

  if (data.current_period_end && new Date(data.current_period_end).getTime() <= Date.now()) {
    return {
      allowed: false,
      reason: "A assinatura expirou.",
    };
  }

  return { allowed: true };
}
