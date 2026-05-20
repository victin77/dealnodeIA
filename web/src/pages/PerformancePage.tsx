import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Insights } from "../lib/types";
import {
  Card,
  PageContainer,
  PageHeader,
  Spinner,
  EmptyState,
} from "../components/ui";
import { LineChart } from "../components/LineChart";
import { scoreColor } from "../lib/format";

export function PerformancePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInsights().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Desempenho" />
        <Card>
          <Spinner />
        </Card>
      </PageContainer>
    );
  }

  if (!data || data.totalAnalyzed === 0) {
    return (
      <PageContainer>
        <PageHeader title="Desempenho" />
        <Card>
          <EmptyState
            title="Ainda não há dados de desempenho"
            hint="Analise algumas reuniões para acompanhar sua evolução como vendedor."
          />
        </Card>
      </PageContainer>
    );
  }

  const chartData = data.scoreTimeline.map((s) => ({
    label: new Date(s.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: s.score,
  }));

  const interest = data.interestDistribution;
  const interestTotal =
    interest.alto + interest.medio + interest.baixo || 1;

  return (
    <PageContainer>
      <PageHeader
        title="Desempenho"
        subtitle="Sua evolução como vendedor, com base nas reuniões analisadas."
      />

      {/* Tiles */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Tile value={data.totalAnalyzed} label="Reuniões analisadas" />
        <Tile
          value={data.avgScore ?? "—"}
          label="Score médio"
          color={data.avgScore != null ? scoreColor(data.avgScore).text : undefined}
        />
        <Tile
          value={data.bestScore ?? "—"}
          label="Melhor score"
          color={
            data.bestScore != null ? scoreColor(data.bestScore).text : undefined
          }
        />
      </div>

      {/* Gráfico */}
      <Card className="mb-5 p-5">
        <h2 className="px-1 font-bold text-neutral-900">
          Evolução do score de fechamento
        </h2>
        <p className="mb-2 px-1 text-xs text-neutral-400">
          Cada ponto é uma reunião analisada
        </p>
        {chartData.length >= 2 ? (
          <LineChart data={chartData} height={240} colorByValue />
        ) : (
          <p className="py-12 text-center text-sm text-neutral-400">
            Analise pelo menos 2 reuniões para ver o gráfico.
          </p>
        )}
      </Card>

      {/* Interesse */}
      <Card className="mb-5 p-5">
        <h2 className="mb-3 font-bold text-neutral-900">
          Nível de interesse dos clientes
        </h2>
        <div className="space-y-2.5">
          {[
            { label: "Alto", value: interest.alto, color: "bg-emerald-500" },
            { label: "Médio", value: interest.medio, color: "bg-amber-500" },
            { label: "Baixo", value: interest.baixo, color: "bg-rose-500" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-sm text-neutral-500">
                {row.label}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${(row.value / interestTotal) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-semibold text-neutral-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Objeções e melhorias */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-neutral-900">
            Objeções que você enfrentou
          </h2>
          <p className="mb-3 text-xs text-neutral-400">
            {data.objections.length} no total
          </p>
          <RefList
            items={data.objections}
            empty="Nenhuma objeção registrada."
            onClick={(id) => navigate(`/reuniao/${id}`)}
          />
        </Card>

        <Card className="p-5">
          <h2 className="font-bold text-neutral-900">
            Pontos de melhoria do coaching
          </h2>
          <p className="mb-3 text-xs text-neutral-400">
            O que a IA sugeriu treinar
          </p>
          <RefList
            items={data.improvements}
            empty="Nenhum ponto registrado."
            onClick={(id) => navigate(`/reuniao/${id}`)}
          />
        </Card>
      </div>
    </PageContainer>
  );
}

function Tile({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <Card className="p-5">
      <p
        className={`text-4xl font-bold tracking-tight ${color ?? "text-neutral-900"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-neutral-400">{label}</p>
    </Card>
  );
}

function RefList({
  items,
  empty,
  onClick,
}: {
  items: { text: string; meetingId: string; meetingTitle: string }[];
  empty: string;
  onClick: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-400">{empty}</p>;
  }
  return (
    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {items.map((it, i) => (
        <li key={i}>
          <button
            onClick={() => onClick(it.meetingId)}
            className="w-full rounded-xl bg-neutral-50 p-3 text-left transition hover:bg-neutral-100"
          >
            <p className="text-sm text-neutral-800">{it.text}</p>
            <p className="mt-0.5 truncate text-xs text-neutral-400">
              em {it.meetingTitle}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
