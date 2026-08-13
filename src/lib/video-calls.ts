import { supabase } from "@/integrations/supabase/client";

export type VideoCallDetails = {
  call: {
    id: string;
    room_name: string;
    status: string;
  };
  serverUrl: string;
  token: string;
};

async function invoke(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke<VideoCallDetails>("video-call", {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (!data) throw new Error("Video call service returned no data.");
  return data;
}

export function createVideoCall(subscriberId: string) {
  return invoke("create", { subscriberId });
}

export function joinVideoCall(callId: string) {
  return invoke("join", { callId });
}

export function endVideoCall(callId: string) {
  return invoke("end", { callId });
}
