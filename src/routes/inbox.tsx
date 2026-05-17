import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { supabase } from "../client.ts";
import { Bell, Heart, UserPlus, ShieldCheck, MessageCircle, Mail } from 'lucide-react';
import { toast } from "sonner";

export const Route = createFileRoute('/inbox')({
  component: InboxPage,
});

function InboxPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: '/auth' });
        return;
      }

      // Updated Query: Uses standard relationship mapping to prevent "fkey" errors
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles (username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      
      setNotifications(data || []);
    } catch (err) {
      console.error("Inbox Error:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="p-6 pt-12 border-b-2 border-white/10 flex justify-between items-center">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Inbox</h1>
        <div className="relative">
          <Bell size={24} className="text-white/50" />
          {notifications.some(n => !n.is_read) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#fe2c55] rounded-full border-2 border-black" />
          )}
        </div>
      </header>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse">
            <p className="font-black italic uppercase tracking-widest text-xs">Checking Alerts...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 flex items-center gap-4 border-b border-white/5 active:bg-white/5 transition-colors ${!n.is_read ? 'bg-white/[0.02]' : ''}`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-800 shrink-0">
                <img 
                  src={n.sender?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${n.sender?.username}`} 
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-bold leading-snug">
                  <span className="text-white">@{n.sender?.username || 'user'}</span>{' '}
                  <span className="text-white/60">
                    {n.type === 'like' && 'liked your shout'}
                    {n.type === 'follow' && 'started following you'}
                    {n.type === 'comment' && `commented: ${n.content}`}
                    {n.type === 'system' && n.content}
                  </span>
                </p>
                <p className="text-[10px] font-black uppercase text-white/20 mt-1 tracking-tighter">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="shrink-0 ml-2">
                {n.type === 'like' && <Heart size={18} className="fill-[#fe2c55] text-[#fe2c55]" />}
                {n.type === 'follow' && <UserPlus size={18} className="text-blue-400" />}
                {n.type === 'comment' && <MessageCircle size={18} className="text-emerald-400" />}
                {n.type === 'system' && <ShieldCheck size={18} className="text-amber-400" />}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 p-10 text-center">
            <Mail size={64} strokeWidth={1} className="mb-4" />
            <p className="font-black italic uppercase text-sm tracking-widest leading-tight">
              Your space is quiet...<br />Go post a shout!
            </p>
          </div>
        )}
      </div>

      {/* Navigation - 5-icon layout */}
      <nav className="fixed bottom-0 w-full h-24 bg-black border-t border-white/10 flex justify-around items-center z-50 px-6">
        <Link to="/feed" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Search</span>
        </Link>
        <div 
          onClick={() => navigate({ to: '/record' })}
          className="w-14 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-3xl shadow-lg cursor-pointer active:scale-90 transition-transform"
        >
          +
        </div>
        <Link to="/inbox" className="flex flex-col items-center text-white">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter text-[#fe2c55]">Inbox</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
