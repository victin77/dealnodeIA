/** Formata segundos como "12 min" ou "1 h 05 min". */
export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  return `${m} min`;
}

/** Cronômetro "MM:SS" (usado na gravação). */
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Data curta em pt-BR: "20 mai 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Rótulo da chance de fechamento a partir do score. */
export function scoreLabel(score: number): string {
  if (score >= 70) return "Alta chance";
  if (score >= 40) return "Chance média";
  return "Baixa chance";
}

/** Cor semântica do score: verde (alto), âmbar (médio), vermelho (baixo). */
export function scoreColor(score: number): {
  text: string;
  bg: string;
  hex: string;
} {
  if (score >= 70)
    return { text: "text-emerald-600", bg: "bg-emerald-50", hex: "#059669" };
  if (score >= 40)
    return { text: "text-amber-600", bg: "bg-amber-50", hex: "#d97706" };
  return { text: "text-rose-600", bg: "bg-rose-50", hex: "#e11d48" };
}

/** Primeiro nome do usuário. */
export function firstName(name: string | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? "";
}
