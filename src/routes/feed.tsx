import { useState, useEffect, useRef } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { supabase } from "../client.ts";
import { Heart, MessageCircle, Share2, Search, Home, User, PlusSquare } from 'lucide-react';
import { toast } from "sonner";

export const Route = createFileRoute('/feed')({
  component: FeedPage,
});

function FeedPage() {
  const navigate = useNavigate();
  const [shouts, setShouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopTab, setActiveTopTab] = useState('foryou');

  useEffect(() => {
    fetchShouts();
  }, [activeTopTab]);

  const fetchShouts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('shouts')
        .select(`*, profiles(username)`)
        .order('created_at', { ascending: false });

      if (activeTopTab === 'following' && user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = followData?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          setShouts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const formatted = data?.map(s => ({
        id: s.id,
        video_url: s.video_url,
        username: s.profiles?.username || 'shouter',
        caption: s.caption || '',
        likes: '0',
        comments: '0'
      })) || [];
      
      setShouts(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center text-white font-black italic uppercase animate-pulse">
      Loading...
    </div>
  );

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* TOP NAVIGATION */}
      <header className="w-full bg-black z-50 flex justify-center items-center pt-8 pb-4 px-6 gap-6 border-b border-white/5">
        <button 
          onClick={() => setActiveTopTab('following')} 
          className={`text-[15px] font-bold transition-colors ${activeTopTab === 'following' ? 'text-white' : 'text-white/40'}`}
        >
          Following
        </button>
        <button 
          onClick={() => setActiveTopTab('foryou')} 
          className={`text-[15px] font-bold relative transition-colors ${activeTopTab === 'foryou' ? 'text-white' : 'text-white/40'}`}
        >
          For You
          {activeTopTab === 'foryou' && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
          )}
        </button>

        <div 
          onClick={() => navigate({ to: '/search' })} 
          className="absolute right-6 text-white/80 cursor-pointer active:scale-90 hover:text-white transition-all"
        >
          <Search size={20} />
        </div>
      </header>

      {/* FEED SCROLL AREA */}
      <main className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black pb-24">
        {shouts.length > 0 ? (
          shouts.map((shout) => <VideoPost key={shout.id} shout={shout} />)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
             <p className="font-bold uppercase tracking-tighter">No shouts to show here yet!</p>
          </div>
        )}
      </main>

      {/* UPDATED BOTTOM NAV WITH INBOX */}
      <nav className="fixed bottom-0 w-full h-24 bg-black border-t border-white/10 flex justify-around items-center z-50 px-6">
        <Link to="/feed" className="flex flex-col items-center text-white">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Home</span>
        </Link>
        
        <Link to="/search" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Search</span>
        </Link>
        
        <div 
          onClick={() => navigate({ to: '/record' })} 
          className="w-14 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-3xl shadow-lg cursor-pointer active:scale-95 transition-transform"
        >
          +
        </div>
        
        <Link to="/inbox" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Inbox</span>
        </Link>
        
        <Link to="/profile" className="flex flex-col items-center text-white/40 hover:text-white transition-colors">
          <span className="text-2xl">??</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

function VideoPost({ shout }: { shout: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
      else videoRef.current?.pause();
    }, { threshold: 0.6 });
    
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative h-full w-full snap-start bg-black flex items-center justify-center overflow-hidden">
      <video 
        ref={videoRef} 
        src={shout.video_url} 
        className="w-full h-full object-cover" 
        loop 
        playsInline 
        muted 
      />
      <div className="absolute right-4 bottom-10 flex flex-col gap-6 items-center z-20 text-white">
        <div className="flex flex-col items-center">
          <Heart size={32} fill="white" />
          <span className="text-[12px] font-black">{shout.likes}</span>
        </div>
        <div className="flex flex-col items-center">
          <MessageCircle size={32} fill="white" />
          <span className="text-[12px] font-black">{shout.comments}</span>
        </div>
        <Share2 size={32} fill="white" />
      </div>
      <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent z-10 text-white">
        <h3 className="font-black text-base mb-1">@{shout.username}</h3>
        <p className="text-[14px] font-medium leading-snug mb-3 line-clamp-2 max-w-[80%]">
          {shout.caption}
        </p>
      </div>
    </section>
  );
}
