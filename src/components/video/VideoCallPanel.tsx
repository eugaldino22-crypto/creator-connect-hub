import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { endVideoCall, joinVideoCall, type VideoCallDetails } from "@/lib/video-calls";
import { cn } from "@/lib/utils";

type LiveKitRoom = any;
type LiveKitParticipant = any;
type LiveKitTrack = any;

function loadLiveKitClient(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Video calling is only available in the browser."));
  if ((window as any).LivekitClient) return Promise.resolve((window as any).LivekitClient);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-secret-livekit="true"]');
    const script = existing ?? document.createElement("script");
    const finish = () => (window as any).LivekitClient ? resolve((window as any).LivekitClient) : reject(new Error("Video calling client is not available."));
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load video calling client.")), { once: true });
    if (!existing) {
      script.src = "https://cdn.jsdelivr.net/npm/livekit-client@2.21.0/dist/livekit-client.umd.min.js";
      script.async = true;
      script.dataset.secretLivekit = "true";
      document.head.appendChild(script);
    }
  });
}

export function VideoCallPanel({ callId, open, onClose }: { callId: string | null; open: boolean; onClose: () => void }) {
  const roomRef = useRef<LiveKitRoom | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [details, setDetails] = useState<VideoCallDetails | null>(null);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [peerName, setPeerName] = useState("Participante");

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      if (!open || !callId) return;
      setError(null);
      setConnected(false);
      try {
        const [next, LivekitClient] = await Promise.all([joinVideoCall(callId), loadLiveKitClient()]);
        if (cancelled) return;
        setDetails(next);
        const room = new LivekitClient.Room();
        roomRef.current = room;
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track: LiveKitTrack, _publication: any, participant: LiveKitParticipant) => {
          if (participant?.name) setPeerName(participant.name);
          if (track.kind === LivekitClient.Track.Kind.Video && remoteVideoRef.current) track.attach(remoteVideoRef.current);
          if (track.kind === LivekitClient.Track.Kind.Audio) track.attach();
        });
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track: LiveKitTrack) => { try { track.detach(); } catch {} });
        room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant: LiveKitParticipant) => { if (participant?.name) setPeerName(participant.name); });
        room.on(LivekitClient.RoomEvent.Disconnected, () => { setConnected(false); onClose(); });
        await room.connect(next.serverUrl, next.token);
        await room.localParticipant.enableCameraAndMicrophone();
        const localPublication = room.localParticipant.getTrackPublication(LivekitClient.Track.Source.Camera);
        const localTrack = localPublication?.videoTrack;
        if (localTrack && localVideoRef.current) localTrack.attach(localVideoRef.current);
        if (!cancelled) { setConnected(true); setMicEnabled(true); setCameraEnabled(true); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Não foi possível iniciar a chamada.");
      }
    }
    connect();
    return () => {
      cancelled = true;
      const room = roomRef.current;
      roomRef.current = null;
      if (room) room.disconnect();
    };
  }, [callId, open, onClose]);

  async function toggleMic() {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }

  async function toggleCamera() {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  }

  async function leave() {
    if (callId) { try { await endVideoCall(callId); } catch {} }
    roomRef.current?.disconnect();
    roomRef.current = null;
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm">
      <div className="relative flex h-[min(88vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300"><Video className="size-5" /></span><div><p className="font-semibold">SECRET Video Call</p><p className="text-xs text-white/60">{connected ? `Conectado · ${peerName}` : "Conectando…"}</p></div></div>
          <span className={cn("rounded-full px-2.5 py-1 text-xs", connected ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300")}>{connected ? "Ao vivo" : "Aguardando"}</span>
        </div>
        <div className="relative flex-1 bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
          <div className="absolute right-4 top-4 h-36 w-52 overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-xl sm:h-44 sm:w-64"><video ref={localVideoRef} muted autoPlay playsInline className="h-full w-full object-cover" /><div className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white">Você</div></div>
          {error ? <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white"><div className="max-w-md"><p className="text-lg font-semibold">Não foi possível iniciar a chamada</p><p className="mt-2 text-sm text-white/65">{error}</p></div></div> : !connected ? <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">Preparando câmera e microfone…</div> : null}
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-neutral-950 px-5 py-4"><Button variant="secondary" size="icon" className="rounded-full" onClick={toggleMic} aria-label={micEnabled ? "Desativar microfone" : "Ativar microfone"}>{micEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}</Button><Button variant="secondary" size="icon" className="rounded-full" onClick={toggleCamera} aria-label={cameraEnabled ? "Desativar câmera" : "Ativar câmera"}>{cameraEnabled ? <Camera className="size-5" /> : <CameraOff className="size-5" />}</Button><Button variant="destructive" size="icon" className="rounded-full" onClick={leave} aria-label="Encerrar chamada"><PhoneOff className="size-5" /></Button></div>
      </div>
    </div>
  );
}
