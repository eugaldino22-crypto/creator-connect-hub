import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { AccessToken } from "npm:livekit-server-sdk@2.17.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return json({ error: "Video calling is not configured." }, 503);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const jwt = authHeader.slice("Bearer ".length);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: userData, error: authError } = await admin.auth.getUser(jwt);
  if (authError || !userData.user) return json({ error: "Unauthorized" }, 401);

  const userId = userData.user.id;
  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  try {
    if (action === "create") {
      const subscriberId = String(body?.subscriberId ?? "");
      if (!subscriberId || subscriberId === userId) return json({ error: "Invalid subscriber." }, 400);

      const { data: role } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "creator")
        .maybeSingle();
      if (!role) return json({ error: "Only creators can start video calls." }, 403);

      const { data: subscription } = await admin
        .from("subscriptions")
        .select("id,status,current_period_end")
        .eq("creator_id", userId)
        .eq("subscriber_id", subscriberId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!subscription) return json({ error: "An active subscription is required for this call." }, 403);

      const callId = crypto.randomUUID();
      const roomName = `secret-${callId}`;
      const { data: call, error: insertError } = await admin
        .from("video_calls")
        .insert({ id: callId, creator_id: userId, subscriber_id: subscriberId, room_name: roomName, status: "ringing" })
        .select("id,room_name,status")
        .single();
      if (insertError) throw insertError;

      const token = await makeToken(livekitApiKey, livekitApiSecret, roomName, userId, "creator", userData.user.email ?? undefined);
      return json({ call, serverUrl: livekitUrl, token });
    }

    if (action === "join") {
      const callId = String(body?.callId ?? "");
      if (!callId) return json({ error: "Missing callId." }, 400);

      const { data: call, error: callError } = await admin
        .from("video_calls")
        .select("id,creator_id,subscriber_id,room_name,status")
        .eq("id", callId)
        .maybeSingle();
      if (callError) throw callError;
      if (!call) return json({ error: "Call not found." }, 404);
      if (userId !== call.creator_id && userId !== call.subscriber_id) return json({ error: "Forbidden" }, 403);
      if (["ended", "cancelled"].includes(call.status)) return json({ error: "This call has ended." }, 410);

      const { data: subscription } = await admin
        .from("subscriptions")
        .select("id")
        .eq("creator_id", call.creator_id)
        .eq("subscriber_id", call.subscriber_id)
        .eq("status", "active")
        .maybeSingle();
      if (!subscription) return json({ error: "An active subscription is required." }, 403);

      const participantRole = userId === call.creator_id ? "creator" : "subscriber";
      await admin.from("video_calls").update({ status: "active", started_at: call.status === "ringing" ? new Date().toISOString() : undefined }).eq("id", callId).neq("status", "ended");

      const token = await makeToken(livekitApiKey, livekitApiSecret, call.room_name, userId, participantRole, userData.user.email ?? undefined);
      return json({ call: { ...call, status: "active" }, serverUrl: livekitUrl, token });
    }

    if (action === "end") {
      const callId = String(body?.callId ?? "");
      const { data: call } = await admin.from("video_calls").select("id,creator_id,subscriber_id").eq("id", callId).maybeSingle();
      if (!call) return json({ error: "Call not found." }, 404);
      if (userId !== call.creator_id && userId !== call.subscriber_id) return json({ error: "Forbidden" }, 403);
      const { error } = await admin.from("video_calls").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", callId);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error(error);
    return json({ error: "Video call operation failed." }, 500);
  }
});

async function makeToken(apiKey: string, apiSecret: string, room: string, identity: string, role: string, name?: string) {
  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata: JSON.stringify({ app: "SECRET", role }),
    ttl: "2h",
  });
  token.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  return await token.toJwt();
}
