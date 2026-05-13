export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="grid place-items-center rounded-2xl shadow-md"
        style={{ width: 40, height: 40, background: "var(--primary)" }}
      >
        <span style={{ fontSize: 22 }}>📣</span>
      </div>
      <span className="text-2xl font-extrabold tracking-tight">
        Shout<span style={{ color: "var(--primary)" }}>Tube</span>
      </span>
    </div>
  );
}
