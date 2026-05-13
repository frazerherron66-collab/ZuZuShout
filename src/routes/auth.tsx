import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AVATAR_OPTIONS, AvatarMask, type AvatarTemplate } from "@/components/AvatarMask";
import { toast } from "sonner";

const search = z.object({
  role: z.enum(["child", "parent"]).default("child"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  component: AuthPage,
});

function AuthPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<AvatarTemplate>("fox");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username: username || email.split("@")[0], role, avatar },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify, then sign in.");
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
        navigate({ to: prof?.role === "parent" ? "/parent" : "/child" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card-bubbly w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-block rounded-full px-4 py-1.5 mb-3 font-bold text-xs uppercase tracking-wider" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
            {role === "parent" ? "Parent" : "Kid"} • {mode === "signup" ? "Sign up" : "Sign in"}
          </div>
          <h1 className="text-3xl font-extrabold">
            {mode === "signup" ? `Welcome, ${role === "parent" ? "guardian!" : "creator!"}` : "Welcome back!"}
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Username">
                <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={2} maxLength={30} className={inputClass} placeholder="awesome_fox" />
              </Field>
              {role === "child" && (
                <div>
                  <label className="block font-bold mb-2">Pick your avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setAvatar(o.id)}
                        className={`rounded-2xl p-2 transition-all ${avatar === o.id ? "ring-4 ring-offset-2" : "opacity-70 hover:opacity-100"}`}
                        style={{ ['--tw-ring-color' as string]: "var(--primary)" }}
                        aria-label={o.label}
                      >
                        <AvatarMask template={o.id} size={48} />
                        <div className="text-xs mt-1 font-bold">{o.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
          </Field>
          <button type="submit" disabled={busy} className="btn-bubbly btn-primary w-full disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "signup" ? (
            <button onClick={() => setMode("login")} className="font-bold underline">Already have an account? Sign in</button>
          ) : (
            <button onClick={() => setMode("signup")} className="font-bold underline">New here? Create an account</button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-2xl border-2 border-input bg-white px-4 py-3 text-base font-medium focus:outline-none focus:border-primary transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-bold mb-1.5">{label}</label>
      {children}
    </div>
  );
}
