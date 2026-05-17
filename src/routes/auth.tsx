import { useState } from 'react';
import { supabase } from "../client";
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from "sonner";

export const Route = createFileRoute('/auth')({
  component: AuthPage,
});

function AuthPage() {
  const { role } = Route.useSearch<{ role?: string }>();
  const currentRole = role || 'child';
  
  const [isLoggingIn, setIsLoggingIn] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLoggingIn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate({ to: currentRole === 'parent' ? '/parent-dashboard' : '/feed' });
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { role: currentRole } } 
      });

      if (authError) {
        toast.error(authError.message);
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id, 
              username: email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`,
              bio: 'Welcome to my space! 🚀'
            }
          ]);

        if (profileError) {
          console.error("Profile auto-creation error:", profileError);
        }

        toast.success("Account Created! You can log in now.");
        setIsLoggingIn(true);
      }
    }
    setLoading(false);
  };

  const isParent = currentRole === 'parent';
  const bgColor = isParent ? 'bg-slate-900' : 'bg-yellow-400';
  const inputFocusColor = isParent ? 'focus:border-slate-700 focus:ring-slate-100' : 'focus:border-yellow-400 focus:ring-yellow-100';

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-6 transition-colors duration-500`}>
      <div className="max-w-5xl w-full grid md:grid-cols-12 gap-6 items-stretch">
        
        <div className="md:col-span-4 flex flex-col justify-center order-2 md:order-1">
          <button 
            type="button"
            onClick={() => setIsLoggingIn(!isLoggingIn)}
            className="group h-full bg-white/20 hover:bg-white/30 border-4 border-dashed border-white/60 p-8 rounded-[40px] text-center transition-all flex flex-col items-center justify-center gap-4 shadow-inner"
          >
            <p className="text-white font-black text-2xl uppercase tracking-tighter italic">
              {isLoggingIn ? "New Here?" : "Have an account?"}
            </p>
            <span className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm group-hover:scale-110 transition-transform shadow-lg">
              {isLoggingIn ? "CREATE ACCOUNT" : "GO TO LOGIN"}
            </span>
          </button>
        </div>

        <div className="md:col-span-8 bg-white rounded-[50px] p-10 md:p-16 shadow-2xl border-4 border-black order-1 md:order-2">
          <div className="mb-10">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase text-black leading-none">
              {isLoggingIn ? "Log In" : "Sign Up"}
            </h1>
            <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
              {isParent ? "Parent Dashboard Access" : "Kid Safe Zone"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                className={`w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none ring-4 ring-transparent transition-all ${inputFocusColor}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase ml-4 text-gray-400">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className={`w-full p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-bold outline-none ring-4 ring-transparent transition-all ${inputFocusColor}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_0_rgba(0,0,0,0.2)] mt-4 uppercase italic tracking-tighter"
            >
              {loading ? 'WAITING...' : (isLoggingIn ? "Let's Go! 🚀" : "Register! ✨")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
