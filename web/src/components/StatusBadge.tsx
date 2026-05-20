import type { MeetingStatus } from "../lib/types";

const MAP: Record<
  MeetingStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  created: {
    label: "Na fila",
    className: "bg-neutral-100 text-neutral-500",
    pulse: true,
  },
  transcribing: {
    label: "Transcrevendo",
    className: "bg-neutral-100 text-neutral-600",
    pulse: true,
  },
  analyzing: {
    label: "Analisando",
    className: "bg-neutral-100 text-neutral-600",
    pulse: true,
  },
  ready: { label: "Pronto", className: "bg-emerald-50 text-emerald-700" },
  error: { label: "Erro", className: "bg-rose-50 text-rose-700" },
};

export function StatusBadge({ status }: { status: MeetingStatus }) {
  const cfg = MAP[status] ?? MAP.created;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}
    >
      {cfg.pulse && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {cfg.label}
    </span>
  );
}
