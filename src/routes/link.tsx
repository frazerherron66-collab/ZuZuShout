import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

export const Route = createFileRoute("/link")({
  component: LinkParent,
});

function LinkParent() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayCode, setDisplayCode] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    // 1. Convert the first part of their UUID into a clean 6-digit string or use user.id
    // For simplicity with your database rpc, we'll slice a clean 6-character chunk
    const shortCode = user.id.replace(/\D/g, "").slice(0, 6) || "529831";
    setDisplayCode(shortCode);

    // 2. Set up a real-time listener on 'parent_child_links' table
    // The second the parent inputs this code and a link row is created, the child screen unlocks!
    const channel = supabase
      .channel("child-pairing-lock")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "parent_child_links",
          filter: `child_id=eq.${user.id}`,
        },
        async () => {
          toast.success("Device Paired by Grown-up! 🎉");
          await refreshProfile();
          navigate({ to: "/child" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Animated Neon Radar Pulse for pairing status */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-1000" />
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
            <ShieldAlert size={32} className="text-emerald-400" />
          </div>
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-3">
          Device Locked
        </h1>
        
        <p className="text-sm text-white/60 font-medium px-4 mb-8">
          Give this setup code to your grown-up. They need to enter it on their dashboard to activate your account!
        </p>

        {/* Big clean copyable display box for the kid to show the parent */}
        <div className="bg-white text-black font-black text-center py-6 rounded-2xl text-5xl tracking-[0.4em] font-mono shadow-[0_15px_30px_rgba(255,255,255,0.05)] select-all mb-8">
          {displayCode || <Loader2 className="animate-spin mx-auto text-black" size={32} />}
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
          <Loader2 size={12} className="animate-spin text-emerald-400" />
          Waiting for parent approval...
        </div>
      </div>
    </div>
  );
}