import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { avatarOverlay as avatarMask } from "@/components/ui/avatarOverlay";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Search, Flag, Video as VideoIcon, LogOut, Link2 } from "lucide-react";

type Video = Database["public"]["Tables"]["videos"]["Row"];
type Cat = Database["public"]["Enums"]["video_category"];

const CATS: { id: Cat | "all"; label: string; emoji: string }[] = [
  { id: "all", label: "For You", emoji: "✨" },
  { id: "laboratory", label: "Laboratory", emoji: "🧪" },
  { id: "pixel_play", label: "Pixel Play", emoji: "🎮" },
  { id: "studio", label: "Studio", emoji: "🎨" },
  { id: "vibe_flow", label: "Vibe & Flow", emoji: "🎵" },
  { id: "nature_scouts", label: "Nature Scouts", emoji: "🌿" },
];

export const Route = createFileRoute("/child")({
  component: ChildView,
});

function ChildView() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | "all">("all");
  const [videos, setVideos] = useState<Video[]>([]);
  const [shouts, setShouts] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { role: "child" } });
    if (profile && profile.role !== "child") navigate({ to: "/parent" });
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    setPaused(profile?.paused ?? false);
  }, [profile?.paused]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`profile-${user.id}`)
      .on("postgres_changes", { 
          event: "UPDATE", 
          schema: "public", 
          table: "profiles", 
          filter: `id=eq.${user.id}` 
      }, (p) => { 
          setPaused(Boolean((p.new as Record<string, unknown>).paused)); 
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => {
    let q = supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (cat !== "all") q = q.eq("category", cat);
    q.then(({ data }) => setVideos(data ?? []));
  }, [cat]);

  useEffect(() => {
    if (!user) return;
    supabase.from("shouts").select("video_id").eq("child_id", user.id)
      .then(({ data }) => setShouts(new Set((data ?? []).map((s) => s.video_id))));
  }, [user]);

  const shout = async (videoId: string) => {
    if (!user) return;
    if (shouts.has(videoId)) {
      await supabase.from("shouts").delete().eq("child_id", user.id).eq("video_id", videoId);
      setShouts((s) => { const n = new Set(s); n.delete(videoId); return n; });
    } else {
      const { error } = await supabase.from("shouts").insert({ child_id: user.id, video_id: videoId });
      if (error) { toast.error(error.message); return; }
      setShouts((s) => new Set(s).add(videoId));
      toast.success("📣 Shouted!");
    }
  };

  const report = async (videoId: string) => {
    if (!user) return;
    await supabase.from("reports").insert({ reporter_id: user.id, video_id: videoId });
    toast.success("Thanks — a grown-up will check this.");
  };

  const submitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !search.trim()) return;
    await supabase.from("search_history").insert({ child_id: user.id, query: search.trim().slice(0, 200) });
    toast.success(`Searching for "${search}"`);
    setSearch("");
  };

  if (loading || !profile) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b-2 border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <AvatarMask template={profile.avatar} size={44} />
          <div className="flex-1">
            <div className="font-extrabold text-lg leading-tight">Hi {profile.username}!</div>
            <div className="text-xs text-muted-foreground">
              {profile.paired_with ? "👪 Linked to a parent" : "Not linked yet"}
            </div>
          </div>
          {!profile.paired_with && (
            <Link to="/link" className="btn-bubbly btn-accent !py-2 !px-4 !text-sm">
              <Link2 className="inline w-4 h-4 mr-1" />Link parent
            </Link>
          )}
          <Link to="/record" className="btn-bubbly btn-primary !py-2 !px-4 !text-sm">
            <VideoIcon className="inline w-4 h-4 mr-1" />Record
          </Link>
          <button onClick={signOut} className="p-2 rounded-full hover:bg-muted" aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3">
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shouts…"
                maxLength={100}
                className="w-full rounded-full border-2 border-input bg-white pl-12 pr-4 py-2.5 font-medium focus:outline-none focus:border-primary" />
            </div>
          </form>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-bold text-sm transition ${
                cat === c.id ? "btn-primary shadow-md" : "bg-secondary text-secondary-foreground"
              }`}
              style={cat === c.id ? { background: "var(--primary)", color: "var(--primary-foreground)" } : {}}
            >
              <span className="mr-1">{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {videos.length === 0 && <p className="text-center text-muted-foreground">No videos yet.</p>}
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} shouted={shouts.has(v.id)} onShout={() => shout(v.id)} onReport={() => report(v.id)} />
        ))}
      </main>

      {paused && <PauseOverlay />}
    </div>
  );
}

function VideoCard({ video, shouted, onShout, onReport }: { video: Video; shouted: boolean; onShout: () => void; onReport: () => void }) {
  const [popping, setPopping] = useState(false);
  const handleShout = () => {
    if (!shouted) { setPopping(true); setTimeout(() => setPopping(false), 500); }
    onShout();
  };
  return (
    <article className="card-bubbly !p-0 overflow-hidden">
      <div className="flex">
        <div className="flex-1 bg-black aspect-[9/14] sm:aspect-video relative">
          <video src={video.video_url} controls playsInline className="w-full h-full object-cover" preload="metadata" />
        </div>
        <aside className="w-20 shrink-0 flex flex-col items-center justify-end gap-4 p-3 bg-card">
          <button onClick={handleShout} className="flex flex-col items-center gap-1 group" aria-label="Shout">
            <div className={`w-14 h-14 rounded-full grid place-items-center text-2xl shadow-lg ${popping ? "animate-shout" : ""}`}
              style={{ background: shouted ? "var(--shout)" : "var(--accent)", color: shouted ? "white" : "var(--accent-foreground)" }}>
              📣
            </div>
            <span className="text-xs font-bold">{shouted ? "Shouted!" : "Shout"}</span>
          </button>
          <button onClick={onReport} className="flex flex-col items-center gap-1" aria-label="Report">
            <div className="w-12 h-12 rounded-full grid place-items-center bg-muted">
              <Flag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Report</span>
          </button>
        </aside>
      </div>
      <div className="p-4 flex items-center gap-3 border-t-2 border-border">
        <AvatarMask template={video.creator_avatar} size={40} />
        <div className="flex-1">
          <h3 className="font-bold leading-tight">{video.title}</h3>
          <p className="text-xs text-muted-foreground">@{video.creator_name}</p>
        </div>
      </div>
    </article>
  );
}

function PauseOverlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6" style={{ background: "oklch(0.18 0.05 295 / 0.92)" }}>
      <div className="card-bubbly text-center max-w-md" style={{ background: "var(--accent)" }}>
        <div className="text-7xl mb-4">⏸️</div>
        <h2 className="text-4xl font-extrabold mb-2">Time for a Break!</h2>
        <p className="text-lg font-medium">A grown-up has paused ShoutTube. Take a stretch! 🌿</p>
      </div>
    </div>
  );
}