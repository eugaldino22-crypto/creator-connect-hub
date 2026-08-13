# SECRET Video Calls

A SECRET supports one-to-one video calls between a creator and an active subscriber.

## Architecture

- **Media layer:** LiveKit Cloud.
- **Client:** LiveKit Client SDK loaded in the application shell.
- **Authorization:** Supabase Edge Function `video-call`.
- **Persistence:** `public.video_calls`.
- **Access rule:** creator and subscriber must have an active subscription relationship.
- **Secrets:** `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are server-side only.

LiveKit access tokens encode the participant identity, room and permissions and must be generated server-side. The SECRET token endpoint grants audio/video publish and subscribe capabilities only after validating the authenticated Supabase user and the active subscription relationship.

## Required secrets

Configure these in the Supabase Edge Function environment:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

Do **not** place `LIVEKIT_API_SECRET` in `VITE_*` variables or browser code.

## User flow

1. Creator opens **Studio → Assinantes**.
2. Only active subscribers are displayed.
3. Creator selects **Fazer videochamada**.
4. SECRET creates a private call session and issues a short-lived LiveKit token.
5. Subscriber sees an incoming-call banner in the authenticated application shell.
6. Subscriber accepts the call and receives a server-issued token.
7. Both participants connect to the same private LiveKit room.
8. Either participant can end the call.

## Production hardening

The current MVP intentionally keeps the feature one-to-one. Before launch, add rate limiting, abuse reporting, call timeout cleanup, presence/availability, and a retention policy for call metadata. Call media is not recorded by the SECRET MVP.
