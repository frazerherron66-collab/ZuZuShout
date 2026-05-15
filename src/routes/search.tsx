import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, Users, Trophy, Music, Zap, Star, ChevronRight, TrendingUp, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

export const Route = createFileRoute('/search')({
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [trendingUsers, setTrendingUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      // 1. Fetch Dynamic Trending Topics from shouts table
      const { data: shoutData } = await supabase
        .from('shouts')
        .select('caption')
        .limit(10);

      if (shoutData) {
        const topics = shoutData
          .map(s => s.caption?.split(' ')[0]?.toUpperCase())
          .filter(Boolean)
          .slice(0, 4);
        
        const formattedTopics = topics.map((name, i) => ({
          id: i,
          name: name || 'TRENDING',
          icon: [ <Trophy />, <Zap />, <Music />, <Star /> ][i % 4],
          color: [ 'bg-yellow-400/5', 'bg-emerald-400/5', 'bg-pink-400/5', 'bg-blue-400/5' ][i % 4]
        }));
        setTrendingTopics(formattedTopics);
      }

      // 2. Fetch Trending Users
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .limit(4);

      if (userData) {
        setTrendingUsers(userData);
      }
    };

    fetchDiscoveryData();
  }, []);

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
      if (data) setSearchResults(data);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollow = async (targetUserId: string, targetUsername: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Login to follow users!");

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, following_id: targetUserId }]);

    if (!error) {
      toast.success(`Following @${targetUsername}`);
    } else {
      toast.info("Already following!");
    }
  };

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col font-sans">
      {/* SEARCH HEADER */}
      <header className="p-6 pt-12 border-b-2 border-white/10 flex items-center gap-4">
        <button onClick={() => navigate({ to: '/feed' })} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="relative group flex-1">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH USERS OR TOPICS..." 
            className="w-full bg-[#111] border-2 border-white/5 rounded-full py-4 pl-14 pr-6 text-xs font-black italic uppercase tracking-[0.2em] focus:outline-none focus:border-[#fe2c55]/50 transition-all placeholder:text-white/10"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {!isSearching ? (
          <div className="p-6 space-y-10">
            
            {/* 1. TRENDING TOPICS */}
            <section>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="text-[#fe2c55] text-2xl">#</span> TRENDING TOPICS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {trendingTopics.map((topic) => (
                  <button 
                    key={topic.id} 
                    onClick={() => setSearchQuery(topic.name)} 
                    className={`flex flex-col items-start p-6 rounded-[2rem] border-2 border-white/5 ${topic.color} active:scale-95 transition-all`}
                  >
                    <div className="mb-4 text-white/80">{topic.icon}</div>
                    <span className="font-black italic uppercase text-[11px] tracking-widest">{topic.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. TRENDING USERS */}
            <section>
              <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <TrendingUp className="text-blue-500" size={24} /> TRENDING USERS
              </h2>
              <div className="space-y-3">
                {trendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-zinc-800">
                        <img 
                          src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-black italic uppercase text-sm tracking-tight">@{user.username}</p>
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter flex items-center gap-1">
                          <TrendingUp size={10} /> Rising Star
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleFollow(user.id, user.username)}
                      className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase active:scale-90 transition-transform"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* SEARCH RESULTS VIEW */
          <div className="p-6 space-y-4">
            {searchResults.length > 0 ? searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate({ to: '/profile' })}>
                  <img src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} className="w-14 h-14 rounded-full border-2 border-white/20 bg-zinc-800" />
                  <div>
                    <h3 className="font-black italic uppercase tracking-tighter">@{user.username}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase truncate max-w-[150px]">{user.bio || 'New Shouter'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(user.id, user.username)}
                  className="bg-[#fe2c55] p-3 rounded-xl active:scale-90 transition-all shadow-lg"
                >
                  <Zap size={18} fill="white" />
                </button>
              </div>
            )) : (
              <p className="text-center text-white/20 font-black italic uppercase text-xs py-20 tracking-widest">No shouters found</p>
            )}
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 w-full h-24 bg-black border-t border-white/10 flex justify-around items-center z-50 px-6">
        <Link to="/feed" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center text-white">
          <span className="text-2xl">🔍</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter text-[#fe2c55]">Search</span>
        </Link>
        <div onClick={() => navigate({ to: '/record' })} className="w-14 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-3xl shadow-lg cursor-pointer active:scale-90 transition-transform">+</div>
        <Link to="/inbox" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">📩</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Inbox</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-white/40">
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Profile</span>
        </Link>
      </nav>
    </div>
  );
}