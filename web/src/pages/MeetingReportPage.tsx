import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Folder, MeetingDetail } from "../lib/types";
import { ScoreRing } from "../components/ScoreRing";
import { StatusBadge } from "../components/StatusBadge";
import { PageContainer, Card, Spinner } from "../components/ui";
import {
  IconArrowLeft,
  IconCheck,
  IconFolder,
  IconWhatsApp,
} from "../components/icons";
import { formatDuration, scoreColor, scoreLabel } from "../lib/format";

export function MeetingReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listFolders()
      .then((r) => setFolders(r.folders))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await api.getMeeting(id);
    setMeeting(res.meeting);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!meeting) return;
    if (!["created", "transcribing", "analyzing"].includes(meeting.status))
      return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [meeting, load]);

  async function changeFolder(value: string) {
    if (!meeting) return;
    const folderId = value || null;
    setMeeting({ ...meeting, folderId });
    try {
      await api.moveMeeting(meeting.id, folderId);
    } catch {
      load();
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <Spinner label="Carregando relatório…" />
        </Card>
      </PageContainer>
    );
  }
  if (!meeting) {
    return (
      <PageContainer>
        <Card className="p-10 text-center text-neutral-500">
          Reunião não encontrada.
        </Card>
      </PageContainer>
    );
  }

  const processing = ["created", "transcribing", "analyzing"].includes(
    meeting.status
  );

  return (
    <PageContainer>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 no-print"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {meeting.title}
          </h1>
          <p className="text-sm text-neutral-500">
            {meeting.clientName ? `${meeting.clientName} · ` : ""}
            {formatDuration(meeting.durationSeconds)}
          </p>
        </div>
        <StatusBadge status={meeting.status} />
      </div>

      {/* Seletor de pasta */}
      <div className="mt-3 flex items-center gap-2 no-print">
        <IconFolder className="h-4 w-4 text-neutral-400" />
        <select
          value={meeting.folderId ?? ""}
          onChange={(e) => changeFolder(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm font-medium text-neutral-700 outline-none transition focus:border-neutral-900"
        >
          <option value="">Sem pasta</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {processing && <ProcessingState status={meeting.status} />}

      {meeting.status === "error" && (
        <Card className="mt-5 p-6">
          <p className="font-semibold text-neutral-900">
            Erro ao processar a reunião
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {meeting.errorMessage ?? "Tente enviar o arquivo novamente."}
          </p>
        </Card>
      )}

      {meeting.status === "ready" && meeting.report && (
        <Report meeting={meeting} />
      )}
    </PageContainer>
  );
}

function ProcessingState({ status }: { status: string }) {
  const steps = [
    { key: "transcribing", label: "Transcrevendo o áudio" },
    { key: "analyzing", label: "Analisando a conversa" },
    { key: "ready", label: "Montando o relatório" },
  ];
  const order = ["created", "transcribing", "analyzing", "ready"];
  const current = order.indexOf(status);

  return (
    <Card className="mt-5 p-8 text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900" />
      <p className="font-semibold text-neutral-900">Processando reunião…</p>
      <p className="text-sm text-neutral-500">
        Isso leva alguns instantes. A página atualiza sozinha.
      </p>
      <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left">
        {steps.map((s, i) => {
          const done = current > order.indexOf(s.key);
          const active = status === s.key;
          return (
            <div key={s.key} className="flex items-center gap-2.5 text-sm">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-xs ${
                  done || active
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={
                  active ? "font-medium text-neutral-900" : "text-neutral-500"
                }
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Report({ meeting }: { meeting: MeetingDetail }) {
  const { context, content } = meeting.report!;
  const [copied, setCopied] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  function copy(text: string, tag: string) {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  }

  const score = content.closingScore.value;
  const color = scoreColor(score);

  const fullSummary = [
    `RESUMO — ${meeting.title}`,
    "",
    content.executiveSummary,
    "",
    `Score de fechamento: ${score}/100`,
    content.closingScore.reasoning,
  ].join("\n");

  return (
    <div className="mt-5 space-y-4">
      {/* Contexto detectado */}
      <div className="flex flex-wrap gap-2">
        <Chip>{context.meetingType}</Chip>
        <Chip>{context.sector}</Chip>
        <Chip>{context.salesStage}</Chip>
      </div>

      {/* Hero: score */}
      <Card className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        <ScoreRing score={score} size={128} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Probabilidade de fechamento ·{" "}
            <span className={color.text}>{scoreLabel(score)}</span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
            {content.closingScore.reasoning}
          </p>
        </div>
      </Card>

      {/* Seções em 2 colunas */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Section
          title="Resumo executivo"
          action={
            <CopyBtn
              done={copied === "summary"}
              onClick={() => copy(fullSummary, "summary")}
            />
          }
        >
          <p className="text-sm leading-relaxed text-neutral-700">
            {content.executiveSummary}
          </p>
        </Section>

        {content.objections.length > 0 && (
          <Section title="Objeções e como contornar">
            <div className="space-y-2.5">
              {content.objections.map((o, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 p-3.5"
                >
                  <p className="text-sm font-semibold text-rose-700">
                    “{o.objection}”
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                    <span className="font-semibold text-emerald-700">
                      Resposta sugerida:{" "}
                    </span>
                    {o.suggestedResponse}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section
          title="Mensagem de follow-up"
          action={
            <CopyBtn
              done={copied === "followup"}
              onClick={() => copy(content.followUpMessage, "followup")}
            />
          }
        >
          <div className="rounded-2xl bg-neutral-100 p-4 text-sm leading-relaxed text-neutral-800">
            {content.followUpMessage}
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(content.followUpMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 no-print"
          >
            <IconWhatsApp className="h-4 w-4" />
            Abrir no WhatsApp
          </a>
        </Section>

        <Section title="Leitura comercial">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Nível de interesse">
              {content.commercialInsights.interestLevel}
            </Info>
            <Info label="Melhor argumento para o retorno">
              {content.commercialInsights.bestArgument}
            </Info>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            {content.commercialInsights.notes}
          </p>
        </Section>

        <Section title="Coaching de vendas">
          <p className="text-sm italic text-neutral-500">
            {content.sellerCoaching.talkRatioNote}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <ListBlock
              title="Pontos fortes"
              items={content.sellerCoaching.strengths}
              tone="good"
            />
            <ListBlock
              title="O que melhorar"
              items={content.sellerCoaching.improvements}
              tone="warn"
            />
          </div>
        </Section>

        <Section title="Dores do cliente">
          <Bullets items={content.clientPains} />
        </Section>
        <Section title="Soluções discutidas">
          <Bullets items={content.solutionsDiscussed} />
        </Section>
        <Section title="Tópicos abordados">
          <Bullets items={content.topics} />
        </Section>
        <Section title="Decisões tomadas">
          <Bullets items={content.decisions} />
        </Section>

        {content.nextSteps.length > 0 && (
          <Section title="Próximos passos">
            <ul className="space-y-2">
              {content.nextSteps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm"
                >
                  <span className="text-neutral-800">{s.task}</span>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {s.owner ?? "—"}
                    {s.deadline ? ` · ${s.deadline}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Pontos de atenção / riscos">
          <Bullets items={content.risks} />
        </Section>
        <Section title="Dúvidas em aberto">
          <Bullets items={content.openQuestions} />
        </Section>

        {content.questionsAnswers.length > 0 && (
          <Section title="Perguntas e respostas">
            <div className="space-y-2.5">
              {content.questionsAnswers.map((qa, i) => (
                <div key={i} className="text-sm">
                  <p className="font-semibold text-neutral-900">
                    P: {qa.question}
                  </p>
                  <p className="text-neutral-600">R: {qa.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {meeting.transcript && (
        <Section
          title="Transcrição completa"
          action={
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="text-sm font-semibold text-neutral-500 transition hover:text-neutral-900"
            >
              {showTranscript ? "Ocultar" : "Mostrar"}
            </button>
          }
        >
          {showTranscript && (
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-3.5 text-sm leading-relaxed text-neutral-700">
              {meeting.transcript}
            </pre>
          )}
        </Section>
      )}

      <button
        onClick={() => window.print()}
        className="text-sm font-medium text-neutral-400 transition hover:text-neutral-700 no-print"
      >
        Imprimir / exportar PDF
      </button>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold text-neutral-900">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-neutral-600 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {children}
    </span>
  );
}

function CopyBtn({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 no-print"
    >
      {done && <IconCheck className="h-3.5 w-3.5" />}
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-neutral-400">Nada registrado.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />
          {it}
        </li>
      ))}
    </ul>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn";
}) {
  const color = tone === "good" ? "text-emerald-600" : "text-amber-600";
  return (
    <div>
      <p
        className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${color}`}
      >
        {title}
      </p>
      <Bullets items={items} />
    </div>
  );
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm capitalize text-neutral-800">{children}</p>
    </div>
  );
}
