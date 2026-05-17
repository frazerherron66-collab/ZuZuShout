import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/link")({
  component: LinkParent,
});

function LinkParent() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.rpc("redeem_pairing_code", { _code: code.trim() });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Linked! 🎉");
    await refreshProfile();
    navigate({ to: "/child" });
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card-bubbly w-full max-w-md text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-3xl font-extrabold mb-2">Enter your parent's code</h1>
        <p className="text-muted-foreground mb-6">Ask your grown-up for the 6-digit code from their dashboard.</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            className="w-full text-center text-4xl font-extrabold tracking-[0.5em] rounded-2xl border-2 border-input bg-white py-4 focus:outline-none focus:border-primary"
          />
          <button type="submit" disabled={busy || code.length !== 6} className="btn-bubbly btn-primary w-full disabled:opacity-60">
            {busy ? "Linking…" : "Link with parent"}
          </button>
          <button type="button" onClick={() => navigate({ to: "/child" })} className="font-bold underline text-sm">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
