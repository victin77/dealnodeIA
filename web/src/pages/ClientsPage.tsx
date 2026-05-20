import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { MeetingSummary } from "../lib/types";
import {
  Card,
  PageContainer,
  PageHeader,
  Spinner,
  EmptyState,
} from "../components/ui";
import { MeetingRow } from "../components/MeetingRow";
import { formatDate, scoreColor } from "../lib/format";

interface ClientGroup {
  name: string;
  meetings: MeetingSummary[];
  avgScore: number | null;
  lastDate: string;
}

export function ClientsPage() {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    api.listMeetings().then((res) => {
      setMeetings(res.meetings);
      setLoading(false);
    });
  }, []);

  const groups = useMemo<ClientGroup[]>(() => {
    const map = new Map<string, MeetingSummary[]>();
    for (const m of meetings) {
      const key = m.clientName?.trim() || "Sem cliente";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return [...map.entries()]
      .map(([name, list]) => {
        const sorted = [...list].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        const scores = list
          .map((m) => m.closingScore)
          .filter((s): s is number => typeof s === "number");
        return {
          name,
          meetings: sorted,
          avgScore: scores.length
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
          lastDate: sorted[0].createdAt,
        };
      })
      .sort((a, b) => +new Date(b.lastDate) - +new Date(a.lastDate));
  }, [meetings]);

  return (
    <PageContainer>
      <PageHeader
        title="Clientes"
        subtitle="Cada cliente, a linha do tempo do negócio com ele."
      />

      {loading ? (
        <Card>
          <Spinner />
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum cliente ainda"
            hint="Informe o nome do cliente ao criar uma reunião para agrupar aqui."
          />
        </Card>
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-2">
          {groups.map((g) => {
            const expanded = open === g.name;
            return (
              <Card key={g.name} className="overflow-hidden">
                <button
                  onClick={() => setOpen(expanded ? null : g.name)}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-neutral-50"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neutral-900 text-lg font-bold text-white">
                    {g.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">
                      {g.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {g.meetings.length} reunião(ões) · último contato{" "}
                      {formatDate(g.lastDate)}
                    </p>
                  </div>
                  {g.avgScore != null && (
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${scoreColor(g.avgScore).text}`}
                      >
                        {g.avgScore}
                        <span className="text-sm font-medium text-neutral-400">
                          /100
                        </span>
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                        score médio
                      </p>
                    </div>
                  )}
                  <span className="text-neutral-300">
                    {expanded ? "▲" : "▼"}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-neutral-100 p-3">
                    {g.meetings.map((m) => (
                      <MeetingRow key={m.id} meeting={m} />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
