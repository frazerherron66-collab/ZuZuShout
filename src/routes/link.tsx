import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../supabase"; 
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

export const Route = createFileRoute("/link")({
  component: LinkParent,
});

function LinkParent() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayCode, setDisplayCode] = useState<string>("");

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Convert the first part of their UUID into a clean 6-digit layout code
        const shortCode = user.id.replace(/\D/g, "").slice(0, 6) || "529831";
        setDisplayCode(shortCode);
      } else {
        // Fallback safety: If someone lands here completely unauthenticated, kick them back to login
        navigate({ to: "/auth", search: { role: "child" } });
      }
    };

    getUserSession();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    console.log("Subscribing to live pairing checks for child:", userId);

    // Set up our real-time listener using our component's local state ID
    const channel = supabase
      .channel("child-pairing-lock")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "parent_child_links",
          filter: `child_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime pairing event captured!", payload);
          toast.success("Device Paired by Grown-up! 🎉");
          
          // Small operational delay to ensure smooth toast readability before route swap
          setTimeout(() => {
            navigate({ to: "/child" });
          }, 1000);
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Connection Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, navigate]);

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

        {/* Big clean display box for the kid to show the parent - digits split elegantly */}
        <div className="bg-white text-black font-black text-center py-6 rounded-2xl text-4xl tracking-[0.2em] font-mono shadow-[0_15px_30px_rgba(255,255,255,0.05)] select-all mb-8 flex items-center justify-center min-h-[92px]">
          {displayCode ? (
            <span className="pl-[0.2em]">{displayCode.split("").join(" ")}</span>
          ) : (
            <Loader2 className="animate-spin text-zinc-600" size={32} />
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
          <Loader2 size={12} className="animate-spin text-emerald-400" />
          Waiting for parent approval...
        </div>
      </div>
    </div>
  );
}