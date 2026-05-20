import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { MeetingStatus, MeetingSummary } from "../lib/types";
import { Card, PageContainer, PageHeader, Spinner, EmptyState } from "../components/ui";
import { MeetingRow } from "../components/MeetingRow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconSearch } from "../components/icons";

type Filter = "all" | "ready" | "processing" | "error";

const PROCESSING: MeetingStatus[] = ["created", "transcribing", "analyzing"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "ready", label: "Prontas" },
  { key: "processing", label: "Processando" },
  { key: "error", label: "Com erro" },
];

export function HistoryPage() {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const res = await api.listMeetings();
    setMeetings(res.meetings);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const processing = meetings.some((m) => PROCESSING.includes(m.status));
    if (!processing) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [meetings, load]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteMeeting(toDelete);
      setToDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (filter === "ready" && m.status !== "ready") return false;
      if (filter === "processing" && !PROCESSING.includes(m.status))
        return false;
      if (filter === "error" && m.status !== "error") return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hit =
          m.title.toLowerCase().includes(q) ||
          (m.clientName ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [meetings, filter, query]);

  return (
    <PageContainer>
      <PageHeader
        title="Histórico"
        subtitle={`${meetings.length} reunião(ões) analisada(s)`}
      />

      {/* Busca + filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título ou cliente…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-neutral-900"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-3">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              meetings.length === 0
                ? "Nenhuma reunião ainda"
                : "Nada encontrado com esses filtros"
            }
            hint={
              meetings.length === 0
                ? "Crie sua primeira análise na aba Nova reunião."
                : undefined
            }
          />
        ) : (
          <div className="grid gap-x-4 gap-y-0.5 lg:grid-cols-2">
            {filtered.map((m) => (
              <MeetingRow key={m.id} meeting={m} onDelete={setToDelete} />
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir reunião?"
        message="A reunião e o relatório gerado serão removidos permanentemente. Esta ação não pode ser desfeita."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </PageContainer>
  );
}
