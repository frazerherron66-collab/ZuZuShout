import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-slate-900 text-white">
      <div className="absolute top-6 left-6">
        <LogoInline />
      </div>
      <div className="max-w-3xl">
        <div className="inline-block rounded-full px-5 py-2 mb-6 font-bold text-sm bg-emerald-500 text-slate-950">
          The safe video app for kids
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white">
          Shout it out.
          <br />
          <span className="text-amber-400">Stay safe.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-xl mx-auto">
          Animated avatars instead of faces. No comments. No bullying. Real-time parent peace of mind.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/auth" search={{ role: "child" }} className="px-6 py-3 bg-amber-500 text-slate-950 rounded-2xl font-bold shadow-md hover:scale-105 transition-transform">
            I'm a Kid 🎨
          </Link>
          <Link to="/auth" search={{ role: "parent" }} className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-2xl font-bold shadow-md hover:scale-105 transition-transform">
            I'm a Parent 👪
          </Link>
        </div>
        <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
          <Feature emoji="🎭" title="Avatar masks" body="Five animated characters cover your face — never a real photo." />
          <Feature emoji="📣" title="Just Shouts" body="Like videos with one bubbly button. No mean comments allowed." />
          <Feature emoji="⏸️" title="Remote pause" body="Parents can pause the app instantly from their dashboard." />
        </div>
      </div>
    </div>
  );
}

function Feature({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-700 bg-slate-800 shadow-sm text-white">
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{body}</p>
    </div>
  );
}

function LogoInline() {
  return (
    <div className="flex items-center gap-2 text-white">
      <div className="grid place-items-center rounded-2xl shadow-md w-10 h-10 bg-amber-500">
        <span style={{ fontSize: 22 }}>📣</span>
      </div>
      <span className="text-2xl font-extrabold">
        ZuZu<span className="text-amber-400">Shout</span>
      </span>
    </div>
  );
}