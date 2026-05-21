import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Insights, MeetingSummary, Stats } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { Card, PageContainer, Spinner } from "../components/ui";
import { MeetingRow } from "../components/MeetingRow";
import { LineChart } from "../components/LineChart";
import { IconPlus } from "../components/icons";
import { firstName, scoreColor } from "../lib/format";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [m, s, i] = await Promise.all([
      api.listMeetings(),
      api.getStats(),
      api.getInsights(),
    ]);
    setMeetings(m.meetings);
    setStats(s);
    setInsights(i);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const processing = meetings.some((m) =>
      ["created", "transcribing", "analyzing"].includes(m.status)
    );
    if (!processing) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [meetings, load]);

  const chartData = (insights?.scoreTimeline ?? []).map((s) => ({
    label: new Date(s.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: s.score,
  }));

  return (
    <PageContainer>
      {/* Saudação */}
      <Card className="mb-5 flex items-center justify-between gap-4 overflow-hidden p-7">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Olá, {firstName(user?.name) || "vendedor"}!
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Bom te ver de novo. Vamos analisar suas reuniões.
          </p>
          <Link
            to="/nova"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            <IconPlus className="h-5 w-5" />
            Nova reunião
          </Link>
        </div>
        <img
          src="/mascote.png"
          alt="Mascote do DealNote AI"
          className="dn-mascot hidden h-56 w-56 shrink-0 object-contain sm:block"
        />
      </Card>

      {loading ? (
        <Card>
          <Spinner label="Carregando seu painel…" />
        </Card>
      ) : (
        <>
          {/* Estatísticas */}
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile value={stats?.total ?? 0} label={["Reuniões", "no total"]} />
            <StatTile value={stats?.ready ?? 0} label={["Relatórios", "prontos"]} />
            <StatTile
              value={stats?.processing ?? 0}
              label={["Em", "processamento"]}
            />
            <StatTile
              value={stats?.avgClosingScore ?? "—"}
              label={["Score médio", "de fechamento"]}
              color={
                stats?.avgClosingScore != null
                  ? scoreColor(stats.avgClosingScore).text
                  : undefined
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {/* Reuniões recentes */}
            <Card className="p-5 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-bold text-neutral-900">
                  Reuniões recentes
                </h2>
                <Link
                  to="/historico"
                  className="text-xs font-semibold text-neutral-400 transition hover:text-neutral-900"
                >
                  Ver histórico
                </Link>
              </div>

              {meetings.length === 0 ? (
                <div className="px-1 py-10 text-center">
                  <p className="text-sm text-neutral-500">
                    Nenhuma reunião ainda.
                  </p>
                  <Link
                    to="/nova"
                    className="mt-1 inline-block text-sm font-semibold text-neutral-900 hover:underline"
                  >
                    Analisar a primeira →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {meetings.slice(0, 6).map((m) => (
                    <MeetingRow key={m.id} meeting={m} />
                  ))}
                </div>
              )}
            </Card>

            {/* Evolução do score */}
            <Card className="p-5 lg:col-span-2">
              <h2 className="px-1 font-bold text-neutral-900">
                Evolução do score
              </h2>
              <p className="mb-2 px-1 text-xs text-neutral-400">
                Chance de fechamento por reunião
              </p>
              {chartData.length >= 2 ? (
                <LineChart data={chartData} height={210} colorByValue />
              ) : (
                <div className="py-14 text-center text-sm text-neutral-400">
                  Analise pelo menos 2 reuniões
                  <br />
                  para ver sua evolução aqui.
                </div>
              )}
              <button
                onClick={() => navigate("/desempenho")}
                className="mt-1 w-full rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200"
              >
                Ver desempenho completo
              </button>
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}

function StatTile({
  value,
  label,
  color,
}: {
  value: string | number;
  label: [string, string];
  color?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-5">
      <span
        className={`text-4xl font-bold tracking-tight ${color ?? "text-neutral-900"}`}
      >
        {value}
      </span>
      <span className="text-xs font-medium leading-tight text-neutral-400">
        {label[0]}
        <br />
        {label[1]}
      </span>
    </Card>
  );
}
