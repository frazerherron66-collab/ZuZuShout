import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AvatarMask, AVATAR_OPTIONS, type AvatarTemplate } from "@/components/AvatarMask";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/record")({
  component: Record,
});

function Record() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [overlay, setOverlay] = useState<AvatarTemplate>("fox");
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar) setOverlay(profile.avatar);
  }, [profile?.avatar]);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Camera not available"));
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate({ to: "/child" })} className="flex items-center gap-1 font-bold mb-4">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h1 className="text-3xl font-extrabold mb-1">Record a Shout</h1>
      <p className="text-muted-foreground mb-4">
        Your face is always covered by your avatar — that's the rule! 🎭
      </p>

      <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-[3/4] shadow-2xl">
        {error ? (
          <div className="absolute inset-0 grid place-items-center text-white text-center p-6">
            <div>
              <div className="text-5xl mb-3">📷</div>
              <p className="font-bold">{error}</p>
              <p className="text-sm opacity-70 mt-2">Allow camera access to record.</p>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {/* Mandatory avatar overlay covering the face */}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="-translate-y-8">
                <AvatarMask template={overlay} size={220} />
              </div>
            </div>
            {recording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1 bg-destructive text-destructive-foreground font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-5">
        <p className="font-bold mb-2">Change avatar mask</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_OPTIONS.map((o) => (
            <button key={o.id} onClick={() => setOverlay(o.id)}
              className={`rounded-2xl p-2 transition ${overlay === o.id ? "ring-4 ring-offset-2 ring-primary" : "opacity-60 hover:opacity-100"}`}>
              <AvatarMask template={o.id} size={48} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            if (!recording) toast.success("Recording started — your avatar keeps you safe!");
            else toast.success("Saved to drafts (demo)");
            setRecording((r) => !r);
          }}
          disabled={!stream}
          className="btn-bubbly btn-primary disabled:opacity-50"
        >
          {recording ? "⏹ Stop" : "● Start recording"}
        </button>
      </div>
    </div>
  );
}
