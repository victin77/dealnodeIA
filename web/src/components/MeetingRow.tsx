import { useNavigate } from "react-router-dom";
import type { MeetingSummary } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { IconMic, IconTrash, IconUpload } from "./icons";
import { formatDate, formatDuration, scoreColor } from "../lib/format";

interface Props {
  meeting: MeetingSummary;
  onDelete?: (id: string) => void;
}

/** Linha de reunião reutilizada no Dashboard e no Histórico. */
export function MeetingRow({ meeting: m, onDelete }: Props) {
  const navigate = useNavigate();
  const Icon = m.source === "recording" ? IconMic : IconUpload;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/reuniao/${m.id}`)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/reuniao/${m.id}`)}
      className="flex cursor-pointer items-center gap-3.5 rounded-2xl px-3 py-2.5 transition hover:bg-neutral-50"
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {m.title}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {m.clientName ? `${m.clientName} · ` : ""}
          {formatDate(m.createdAt)} · {formatDuration(m.durationSeconds)}
        </p>
      </div>

      {m.closingScore != null && (
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-bold sm:inline-block ${scoreColor(m.closingScore).bg} ${scoreColor(m.closingScore).text}`}
        >
          {m.closingScore}
          <span className="ml-0.5 font-medium opacity-60">/100</span>
        </span>
      )}

      <StatusBadge status={m.status} />

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(m.id);
          }}
          title="Excluir"
          className="rounded-lg p-1.5 text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
