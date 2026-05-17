import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { supabase } from "@/integrations/supabase/client.server";
import { ArrowLeft, Grid, Heart, Lock, X, ChevronDown, Check, Play, QrCode } from 'lucide-react';
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react'; // Import the QR component

const AVATAR_LIBRARY = [
  { id: 'lion', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lion' },
  { id: 'panda', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Panda' },
  { id: 'cat', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kitty' },
  { id: 'prince-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Prince' },
  { id: 'princess-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Princess' },
];

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false); // New state for QR
  const [showSuggested, setShowSuggested] = useState(false);
  const [suggestedAccounts, setSuggestedAccounts] = useState<any[]>([]);
  const [userShouts, setUserShouts] = useState<any[]>([]);

  const [profile, setProfile] = useState({
    username: '',
    avatar_url: '',
    id: '',
    bio: 'A short bio to describe your space ??',
    following: 0,
    followers: 0,
    likes: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchSuggested();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id);

    const { data: shoutsData } = await supabase
      .from('shouts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (profileData) {
      setProfile({
        ...profileData,
        id: user.id, // Ensure ID is stored for the QR code
        following: followingCount || 0,
        followers: followersCount || 0,
        likes: profileData.total_likes || 0
      });
    }
    
    if (shoutsData) setUserShouts(shoutsData);
    setLoading(false);
  };

  const fetchSuggested = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', user?.id)
      .limit(5);
    
    if (data) setSuggestedAccounts(data);
  };

  const handleFollow = async (targetUserId: string, targetUsername: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Please login to follow!");

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: user.id, following_id: targetUserId }]);

    if (error) {
      if (error.code === '23505') toast.info(`Already following @${targetUsername}`);
      else toast.error(error.message);
    } else {
      toast.success(`Following @${targetUsername}`);
      fetchProfile();
    }
  };

  const handleSaveProfile = async (newUsername: string, newAvatarUrl: string, newBio: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        username: newUsername, 
        avatar_url: newAvatarUrl,
        bio: newBio 
    }, { onConflict: 'id' });

    if (!error) {
      setProfile(prev => ({ 
          ...prev, 
          username: newUsername, 
          avatar_url: newAvatarUrl,
          bio: newBio 
      }));
      setShowEditModal(false);
      toast.success("Profile Updated!");
    } else {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-black italic uppercase tracking-widest animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 overflow-x-hidden">
      <header className="flex justify-between items-center p-4 sticky top-0 bg-black z-10 border-b border-white/5">
        <ArrowLeft className="cursor-pointer hover:scale-110 transition-all" onClick={() => navigate({ to: '/feed' })} />
        <h1 className="font-bold text-sm tracking-tight">{profile.username || 'Profile'}</h1>
        {/* QR Button in Header */}
        <QrCode 
          className="cursor-pointer text-white/40 hover:text-white" 
          size={20} 
          onClick={() => setShowQrModal(true)} 
        />
      </header>

      <div className="flex flex-col items-center pt-4 px-6">
        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-900 overflow-hidden mb-3 shadow-2xl">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-zinc-700 to-zinc-900" />
          )}
        </div>
        
        <p className="font-bold text-base mb-6 flex items-center gap-1">
          @{profile.username || 'user'} <span className="bg-cyan-400 text-black text-[8px] p-0.5 rounded-full"><Check size={8} strokeWidth={4} /></span>
        </p>

        <div className="flex gap-10 mb-6">
          <div className="text-center">
            <p className="font-bold text-lg leading-none">{profile.following}</p>
            <p className="text-zinc-500 text-[11px] mt-1 font-medium">Following</p>
          </div>
          <div className="text-center border-x border-white/10 px-10">
            <p className="font-bold text-lg leading-none">{profile.followers}</p>
            <p className="text-zinc-500 text-[11px] mt-1 font-medium">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg leading-none">{profile.likes}</p>
            <p className="text-zinc-500 text-[11px] mt-1 font-medium">Likes</p>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-xs mb-6">
          <button onClick={() => setShowEditModal(true)} className="flex-1 bg-[#fe2c55] py-2.5 rounded-sm font-bold text-[15px] active:scale-95 transition-all shadow-lg">Edit Profile</button>
          <button onClick={() => setShowSuggested(!showSuggested)} className={`bg-zinc-800 p-2.5 rounded-sm active:scale-90 transition-colors ${showSuggested ? 'bg-zinc-700' : ''}`}>
            <ChevronDown className={`transition-transform duration-300 ${showSuggested ? 'rotate-180' : ''}`} size={18} />
          </button>
        </div>

        {showSuggested && suggestedAccounts.length > 0 && (
          <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Suggested Accounts</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
              {suggestedAccounts.map((acc, i) => (
                <div key={i} className="flex-shrink-0 w-36 bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center snap-center">
                   <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white/5">
                     <img src={acc.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${acc.username}`} className="w-full h-full object-cover" />
                   </div>
                   <p className="text-[11px] font-bold truncate w-full text-center mb-3">@{acc.username}</p>
                   <button 
                    onClick={() => handleFollow(acc.id, acc.username)}
                    className="w-full bg-[#fe2c55] py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                   >
                     Follow
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm mb-4">
          <p className="text-zinc-300 px-10 leading-relaxed font-medium">{profile.bio}</p>
        </div>
      </div>

      <div className="flex border-t border-white/10 mt-4">
        <button onClick={() => setActiveTab('posts')} className={`flex-1 flex justify-center py-3 border-b-2 transition-all ${activeTab === 'posts' ? 'border-white opacity-100' : 'border-transparent opacity-40'}`}><Grid size={22} /></button>
        <button onClick={() => setActiveTab('liked')} className={`flex-1 flex justify-center py-3 border-b-2 transition-all ${activeTab === 'liked' ? 'border-white opacity-100' : 'border-transparent opacity-40'}`}><Lock size={22} className="mr-1" /> <Heart size={22} /></button>
      </div>

      <div className="grid grid-cols-3 gap-[1.5px]">
        {userShouts.length > 0 ? (
          userShouts.map((shout, i) => (
            <div 
              key={shout.id} 
              onClick={() => navigate({ to: '/feed' })}
              className="aspect-[3/4] bg-zinc-900 relative group cursor-pointer overflow-hidden transition-opacity hover:opacity-90 border-zinc-950 border-[0.5px]"
            >
              <video 
                src={shout.video_url} 
                className="w-full h-full object-cover pointer-events-none" 
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-black drop-shadow-lg text-white">
                <Play size={10} fill="white" /> {shout.views || 0}
              </div>
              {i === 0 && (
                <div className="absolute top-2 left-2 bg-[#fe2c55] text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-xl">Latest</div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 py-20 text-center text-zinc-600">
            <p className="text-sm font-black italic uppercase tracking-tighter">No Shouts yet</p>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-[3rem] border border-white/10 flex flex-col items-center">
            <div className="w-full flex justify-end mb-2">
              <X className="cursor-pointer text-white/40" onClick={() => setShowQrModal(false)} />
            </div>
            <h3 className="font-black italic uppercase text-xl tracking-tighter mb-2">Safety ID</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 text-center px-4">
              Ask your parent to scan this to verify your space
            </p>
            
            <div className="p-6 bg-white rounded-[2rem] shadow-2xl mb-8">
              <QRCodeSVG value={profile.id} size={180} level="H" />
            </div>

            <p className="font-mono text-[10px] text-white/20 break-all text-center px-6">
              {profile.id}
            </p>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} onSave={handleSaveProfile} avatarLibrary={AVATAR_LIBRARY} />
      )}
    </div>
  );
}

// ... EditProfileModal component remains the same
