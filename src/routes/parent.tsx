import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
// Updated this line to use the correct alias trick for Vercel
import { AvatarOverlay as AvatarMask } from "@/components/ui/AvatarOverlay";
import { toast } from "sonner";
import { LogOut, RefreshCw, Search as SearchIcon, Sparkles } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Video = Database["public"]["Tables"]["videos"]["Row"];

interface ShoutRow {
  id: string;
  video_id: string;
  created_at: string;
  videos: { title: string; category: string } | null;
}

export const Route = createFileRoute("/parent")({
  component: ParentDashboard,
});

function ParentDashboard() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [child, setChild] = useState<Profile | null>(null);
  const [shouts, setShouts] = useState<ShoutRow[]>([]);
  const [searches, setSearches] = useState<{ id: string; query: string; created_at: string }[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { role: "parent" } });
    if (profile && profile.role !== "parent") navigate({ to: "/child" });
  }, [user, profile, loading, navigate]);

  const loadChild = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("paired_with", user.id).maybeSingle();
    setChild(data ?? null);
    if (data) {
      const [{ data: sh }, { data: se }] = await Promise.all([
        supabase.from("shouts").select("id, video_id, created_at, videos(title, category)").eq("child_id", data.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("search_history").select("id, query, created_at").eq("child_id", data.id).order("created_at", { ascending: false }).limit(50),
      ]);
      setShouts((sh as ShoutRow[]) ?? []);
      setSearches(se ?? []);
    }
  };

  useEffect(() => { loadChild(); }, [user, profile?.paired_with]);

  useEffect(() => {
    if (!child) return;
    const ch = supabase
      .channel(`shouts-${child.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "shouts", filter: `child_id=eq.${child.id}` },
        async (p) => {
          const newRow = p.new as { video_id: string };
          const { data: video } = await supabase.from("videos").select("title").eq("id", newRow.video_id).single();
          toast(`📣 ${child.username} shouted!`, { description: video?.title ?? "A video", duration: 6000 });
          loadChild();
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [child]);

  const generateCode = async () => {
    if (!user) return;
    setGenerating(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const { error } = await supabase.from("profiles").update({ pairing_code: code, pairing_code_expires_at: expires }).eq("id", user.id);
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success("New code ready! Valid for 30 min.");
  };

  const togglePause = async (next: boolean) => {
    if (!child) return;
    const { error } = await supabase.from("profiles").update({ paused: next }).eq("id", child.id);
    if (error) { toast.error(error.message); return; }
    setChild({ ...child, paused: next });
    toast.success(next ? "App paused for your child." : "App resumed.");
  };

  if (loading || !profile) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen pb-12">
      <header className="border-b-2 border-border bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="grid place-items-center rounded-2xl shadow-md w-11 h-11" style={{ background: "var(--primary)" }}>
            <span style={{ fontSize: 22 }}>👪</span>
          </div>
          <div className="flex-1">
            <div className="font-extrabold text-lg leading-tight">Parent Dashboard</div>
            <div className="text-xs text-muted-foreground">{profile.username}</div>
          </div>
          <button onClick={signOut} className="p-2 rounded-full hover:bg-muted" aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {!child ? (
          <div className="card-bubbly text-center">
            <div className="text-6xl mb-3">🔗</div>
            <h2 className="text-2xl font-extrabold mb-2">Link your child's account</h2>
            <p className="text-muted-foreground mb-5">Generate a 6-digit code, then have them enter it on their device.</p>
            {profile.pairing_code && profile.pairing_code_expires_at && new Date(profile.pairing_code_expires_at) > new Date() ? (
              <div className="mb-4">
                <div className="text-5xl font-extrabold tracking-[0.4em] py-4 rounded-2xl" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                  {profile.pairing_code}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Expires {new Date(profile.pairing_code_expires_at).toLocaleTimeString()}
                </p>
              </div>
            ) : null}
            <button onClick={generateCode} disabled={generating} className="btn-bubbly btn-primary disabled:opacity-60">
              <RefreshCw className="inline w-5 h-5 mr-2" />
              {profile.pairing_code ? "Generate new code" : "Generate code"}
            </button>
          </div>
        ) : (
          <>
            <section className="card-bubbly flex flex-wrap items-center gap-4">
              <AvatarMask template={child.avatar} size={72} />
              <div className="flex-1 min-w-[160px]">
                <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Linked child</div>
                <div className="text-2xl font-extrabold">{child.username}</div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <span className="font-bold">Remote Pause</span>
                <span className="relative">
                  <input type="checkbox" className="sr-only peer" checked={child.paused} onChange={(e) => togglePause(e.target.checked)} />
                  <span className="block w-14 h-8 rounded-full bg-muted peer-checked:bg-primary transition" />
                  <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
                </span>
              </label>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <section className="card-bubbly">
                <div className="flex items-center gap-2 mb-4">
                  <div className="grid place-items-center w-9 h-9 rounded-xl" style={{ background: "var(--accent)" }}>📣</div>
                  <h3 className="text-xl font-extrabold">Recent Shouts</h3>
                </div>
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {shouts.length === 0 && <li className="text-muted-foreground text-sm">No shouts yet.</li>}
                  {shouts.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold leading-tight">{s.videos?.title ?? "Video"}</div>
                        <div className="text-xs text-muted-foreground">{s.videos?.category} • {timeAgo(s.created_at)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="card-bubbly">
                <div className="flex items-center gap-2 mb-4">
                  <div className="grid place-items-center w-9 h-9 rounded-xl" style={{ background: "var(--accent)" }}>
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-extrabold">Curiosity Log</h3>
                </div>
                <ul className="space-y-2 max-h-96 overflow-auto">
                  {searches.length === 0 && <li className="text-muted-foreground text-sm">No searches yet.</li>}
                  {searches.map((s) => (
                    <li key={s.id} className="p-3 rounded-2xl bg-muted">
                      <div className="font-bold">"{s.query}"</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(s.created_at)}</div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}