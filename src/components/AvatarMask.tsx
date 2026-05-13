import type { Database } from "@/integrations/supabase/types";

export type AvatarTemplate = Database["public"]["Enums"]["avatar_template"];

export const AVATAR_OPTIONS: { id: AvatarTemplate; label: string; emoji: string; bg: string }[] = [
  { id: "fox",   label: "Fox",   emoji: "🦊", bg: "oklch(0.78 0.18 50)" },
  { id: "panda", label: "Panda", emoji: "🐼", bg: "oklch(0.92 0.02 295)" },
  { id: "robot", label: "Robot", emoji: "🤖", bg: "oklch(0.72 0.15 200)" },
  { id: "cat",   label: "Cat",   emoji: "🐱", bg: "oklch(0.85 0.16 80)" },
  { id: "dino",  label: "Dino",  emoji: "🦖", bg: "oklch(0.8 0.2 145)" },
];

interface AvatarMaskProps {
  template: AvatarTemplate;
  size?: number;
  className?: string;
}

export function AvatarMask({ template, size = 64, className = "" }: AvatarMaskProps) {
  const opt = AVATAR_OPTIONS.find((o) => o.id === template) ?? AVATAR_OPTIONS[0];
  return (
    <div
      className={`flex items-center justify-center rounded-full shadow-lg border-4 border-white ${className}`}
      style={{
        width: size,
        height: size,
        background: opt.bg,
        fontSize: size * 0.55,
        lineHeight: 1,
      }}
      aria-label={opt.label}
    >
      <span style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{opt.emoji}</span>
    </div>
  );
}
