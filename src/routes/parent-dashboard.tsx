import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { 
  ShieldCheck, BarChart3, Lock, Users, Clock, 
  CheckCircle2, ArrowLeft, Eye, Trash2, Camera, X, KeyRound
} from 'lucide-react';
import { toast } from "sonner";
import { Html5QrcodeScanner } from "html5-qrcode";

export const Route = createFileRoute('/parent-dashboard')({
  component: ParentDashboard,
});

function ParentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'queue' | 'social' | 'stats' | 'settings'>('queue');
  
  // --- PIN & ACCESS STATE ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);

  // Multi-Child Monitoring State
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [childShouts, setChildShouts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // Social & Activity Stats
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalShouts: 0, totalLikes: 0, totalComments: 0 });
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(15);

  // --- LOGIC: FETCH PIN & LINKED FAMILY ---
  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('parent_pin')
      .eq('id', user.id)
      .single();

    if (profile?.parent_pin) {
      setSavedPin(profile.parent_pin);
    } else {
      setIsSettingPin(true);
    }

    const { data } = await supabase
      .from('parent_child_links')
      .select(`
        child_id,
        profiles:child_id (id, username, avatar_url)
      `)
      .eq('parent_id', user.id);

    if (data) {
      const children = data.map((item: any) => item.profiles);
      setLinkedChildren(children);
      if (children.length > 0 && !selectedChild) {
        setSelectedChild(children[0]);
      }
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handlePinSubmit = async () => {
    if (pinInput.length < 4 || pinInput.length > 6) {
      return toast.error("PIN must be 4-6 digits");
    }

    if (isSettingPin) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({ parent_pin: pinInput })
        .eq('id', user?.id);

      if (!error) {
        toast.success("PIN set! Dashboard secured.");
        setSavedPin(pinInput);
        setIsSettingPin(false);
        setIsUnlocked(true);
      }
    } else {
      if (pinInput === savedPin) {
        setIsUnlocked(true);
        toast.success("Access Granted");
      } else {
        setPinInput('');
        toast.error("Incorrect PIN");
      }
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } }, 
        false
      );

      scanner.render(async (decodedText) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('parent_child_links')
          .insert([{ parent_id: user.id, child_id: decodedText }]);

        if (error) {
          if (error.code === '23505') toast.info("Child already linked!");
          else toast.error("Could not link account.");
        } else {
          toast.success("New child added to dashboard!");
          fetchInitialData();
        }
        scanner.clear();
        setIsScanning(false);
      }, () => {});
    }, 100);
  };

  useEffect(() => {
    if (selectedChild && isUnlocked) {
      fetchChildData();
    }
  }, [selectedChild, activeTab, isUnlocked]);

  const fetchChildData = async () => {
    const { data: shouts } = await supabase
      .from('shouts')
      .select('*')
      .eq('user_id', selectedChild.id)
      .order('created_at', { ascending: false });

    setChildShouts(shouts || []);
    if (activeTab === 'social') fetchSocial();
    if (activeTab === 'stats') fetchStats();
  };

  const approveShout = async (shoutId: string) => {
    const { error } = await supabase
      .from('shouts')
      .update({ is_approved: true })
      .eq('id', shoutId);

    if (!error) {
      setChildShouts(prev => prev.map(s => s.id === shoutId ? { ...s, is_approved: true } : s));
      toast.success("Shout Approved!");
    }
  };

  const deleteShout = async (shoutId: string) => {
    const confirmed = window.confirm("Remove this post permanently?");
    if (!confirmed) return;
    const { error } = await supabase.from('shouts').delete().eq('id', shoutId);
    if (!error) {
      setChildShouts(prev => prev.filter(s => s.id !== shoutId));
      toast.success("Post removed.");
    }
  };

  const fetchSocial = async () => {
    const { data } = await supabase
      .from('follows')
      .select(`following_id, profiles!follows_following_id_fkey(username, avatar_url)`)
      .eq('follower_id', selectedChild.id);
    setFollowingList(data || []);
  };

  const fetchStats = async () => {
    const { count: sCount } = await supabase.from('shouts').select('*', { count: 'exact', head: true }).eq('user_id', selectedChild.id);
    const { data: shouts } = await supabase.from('shouts').select('id').eq('user_id', selectedChild.id);
    const sIds = shouts?.map(s => s.id) || [];
    const { count: lCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('shout_id', sIds);
    const { count: cCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).in('shout_id', sIds);
    setStats({ totalShouts: sCount || 0, totalLikes: lCount || 0, totalComments: cCount || 0 });
  };

  const triggerTimeOut = async (minutes: number) => {
    if (!selectedChild) return toast.error("Select a child first");
    setIsTimingOut(true);
    const lockoutTime = new Date();
    lockoutTime.setMinutes(lockoutTime.getMinutes() + minutes);
    const { error } = await supabase.from('profiles').update({ lockout_until: minutes > 0 ? lockoutTime.toISOString() : null }).eq('id', selectedChild.id);
    if (!error) {
      toast[minutes > 0 ? 'error' : 'success'](minutes > 0 ? `LOCKOUT ACTIVE` : "Access Restored");
    }
    setIsTimingOut(false);
  };

  // --- RENDER PIN LOCK SCREEN (BRIGHT EMERALD & WHITE TEXT) ---
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-xs flex flex-col items-center text-center">
          <KeyRound size={64} className="text-emerald-400 mb-8 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
          
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
            Parent Lock
          </h2>
          
          <p className="text-white/70 text-[10px] uppercase font-bold tracking-[0.15em] mb-12">
            {isSettingPin ? "Create a 4-6 digit pin to secure your dashboard" : "Enter PIN to access your parental controls"}
          </p>

          <div className="w-full space-y-6">
            <input 
              type="password" 
              pattern="[0-9]*"
              inputMode="numeric"
              value={pinInput}
              maxLength={6}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white/5 border-2 border-emerald-400 rounded-[2rem] py-6 text-center text-5xl font-black tracking-[0.5em] text-white outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all placeholder:text-white/10"
              placeholder="••••"
            />

            <button 
              onClick={handlePinSubmit}
              className="w-full bg-emerald-400 hover:bg-emerald-300 text-black py-5 rounded-[1.5rem] font-black italic uppercase tracking-widest active:scale-95 transition-all shadow-[0_10px_20px_rgba(52,211,153,0.3)]"
            >
              {isSettingPin ? "SET PIN" : "UNLOCK"}
            </button>

            {!isSettingPin && (
              <button 
                onClick={() => navigate({ to: '/profile' })}
                className="text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors pt-2"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-black text-white p-6 pt-12 font-sans pb-24">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: '/profile' })} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20} /></button>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-emerald-500">Parent View</h1>
        </div>
        <button onClick={() => setIsUnlocked(false)} className="p-2 bg-white/5 rounded-full"><Lock size={20} className="text-emerald-500" /></button>
      </header>

      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
        {linkedChildren.map((child) => (
          <button
            key={child.id}
            onClick={() => setSelectedChild(child)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
              selectedChild?.id === child.id ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            <img src={child.avatar_url} className="w-5 h-5 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-tighter">@{child.username}</span>
          </button>
        ))}
        <button onClick={startScanner} className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 active:scale-90 transition-transform">
          <Camera size={18} />
        </button>
      </div>

      <nav className="grid grid-cols-4 gap-1 mb-8 bg-white/5 p-1 rounded-2xl border border-white/5">
        <button onClick={() => setActiveTab('queue')} className={`py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === 'queue' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}><CheckCircle2 size={14} /> Queue</button>
        <button onClick={() => setActiveTab('social')} className={`py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === 'social' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}><Users size={14} /> Social</button>
        <button onClick={() => setActiveTab('stats')} className={`py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}><BarChart3 size={14} /> Activity</button>
        <button onClick={() => setActiveTab('settings')} className={`py-3 rounded-xl font-black italic uppercase text-[9px] flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}><Lock size={14} /> Safety</button>
      </nav>

      <div className="space-y-6">
        {isScanning && (
          <div className="relative">
            <div id="reader" className="overflow-hidden rounded-[2.5rem] bg-black border border-emerald-500/30"></div>
            <button onClick={() => setIsScanning(false)} className="absolute top-4 right-4 bg-red-500 p-2 rounded-full z-20 shadow-xl"><X size={16} /></button>
          </div>
        )}

        {selectedChild ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {activeTab === 'queue' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-emerald-500/50 px-2 tracking-widest">Reviewing Shouts: @{selectedChild.username}</p>
                {childShouts.map((shout) => (
                  <div key={shout.id} className="bg-white/5 rounded-[2rem] overflow-hidden border border-white/5 flex h-32 relative">
                    <video src={shout.video_url} className={`w-24 object-cover bg-black ${!shout.is_approved ? 'opacity-30' : 'opacity-80'}`} />
                    {!shout.is_approved && (
                      <div className="absolute left-8 top-1/2 -translate-y-1/2">
                        <Lock size={16} className="text-yellow-500" />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <p className="text-xs text-white/80 font-medium italic truncate">"{shout.caption}"</p>
                      <div className="flex gap-2">
                        {!shout.is_approved ? (
                          <button onClick={() => approveShout(shout.id)} className="flex-1 bg-emerald-500 text-black py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Approve</button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center gap-1 text-emerald-500 text-[9px] font-black uppercase"><ShieldCheck size={12} /> Live</div>
                        )}
                        <button onClick={() => deleteShout(shout.id)} className="flex-1 bg-red-500/10 text-red-500 py-2 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1 border border-red-500/10"><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest px-2">Following ({followingList.length})</h3>
                {followingList.map((item, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                      <img src={item.profiles?.avatar_url} className="w-10 h-10 rounded-full border border-white/10" />
                      <p className="font-bold text-sm">@{item.profiles?.username}</p>
                    </div>
                    <button className="text-red-500 text-[9px] font-black uppercase bg-red-500/10 px-4 py-2 rounded-xl">Block</button>
                  </div>
                ))}
              </section>
            )}

            {activeTab === 'stats' && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] text-center">
                    <p className="text-4xl font-black italic text-emerald-500">{stats.totalShouts}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">Shouts</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center">
                    <p className="text-4xl font-black italic text-white">{stats.totalLikes}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">Likes</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <section className="bg-red-600/5 border border-red-600/20 rounded-[2.5rem] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock size={20} className="text-red-600" />
                  <h3 className="font-black italic uppercase text-sm text-red-500">Instant Time Out</h3>
                </div>
                <div className="flex gap-3 mb-4">
                  <input type="number" value={customMinutes} onChange={(e) => setCustomMinutes(Number(e.target.value))} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none font-black italic text-xl text-center" />
                  <button onClick={() => triggerTimeOut(customMinutes)} className="bg-red-600 text-white px-8 rounded-2xl font-black italic uppercase text-[10px]">Lock</button>
                </div>
                <button onClick={() => triggerTimeOut(0)} className="w-full bg-white/5 border border-white/10 py-3 rounded-xl font-black italic uppercase text-[9px]">Restore Access</button>
              </section>
            )}
          </div>
        ) : (
          <div className="py-20 text-center opacity-20">
            <Users size={48} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase italic tracking-widest">Select a child or scan to add</p>
          </div>
        )}
      </div>
    </div>
  );
}