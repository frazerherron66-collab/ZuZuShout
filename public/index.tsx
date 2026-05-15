import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="absolute top-6 left-6">
        <LogoInline />
      </div>
      <div className="max-w-3xl">
        <div className="inline-block rounded-full px-5 py-2 mb-6 font-bold text-sm" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
          The safe video app for kids
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Shout it out.
          <br />
          <span style={{ color: "var(--primary)" }}>Stay safe.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
          Animated avatars instead of faces. No comments. No bullying. Real-time parent peace of mind.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/auth" search={{ role: "child" }} className="btn-bubbly btn-primary">
            I'm a Kid 🎨
          </Link>
          <Link to="/auth" search={{ role: "parent" }} className="btn-bubbly btn-accent">
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
    <div className="card-bubbly">
      <div className="text-4xl mb-2">{emoji}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function LogoInline() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid place-items-center rounded-2xl shadow-md" style={{ width: 40, height: 40, background: "var(--primary)" }}>
        <span style={{ fontSize: 22 }}>📣</span>
      </div>
      <span className="text-2xl font-extrabold">Shout<span style={{ color: "var(--primary)" }}>Tube</span></span>
    </div>
  );
}
