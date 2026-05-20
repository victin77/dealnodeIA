import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatClock } from "../lib/format";
import { Card, PageContainer } from "../components/ui";
import { IconArrowLeft, IconMic, IconUpload } from "../components/icons";

type Mode = "upload" | "record";
type RecState = "idle" | "recording" | "paused" | "done";

export function NewMeetingPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("upload");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const [recState, setRecState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function startRecording() {
    setError(null);
    if (!consent) {
      setError("Confirme a autorização dos participantes antes de gravar.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      setRecState("recording");
      startTimer();
    } catch {
      setError(
        "Não foi possível acessar o microfone. Verifique as permissões do navegador."
      );
    }
  }

  function pauseRecording() {
    recorderRef.current?.pause();
    stopTimer();
    setRecState("paused");
  }
  function resumeRecording() {
    recorderRef.current?.resume();
    startTimer();
    setRecState("recording");
  }
  function stopRecording() {
    recorderRef.current?.stop();
    stopTimer();
    setRecState("done");
  }
  function discardRecording() {
    setRecordedBlob(null);
    setRecState("idle");
    setElapsed(0);
  }

  async function handleSubmit() {
    setError(null);
    if (title.trim().length < 2) {
      setError("Dê um título para a reunião.");
      return;
    }
    if (!consent) {
      setError("É necessário confirmar a autorização dos participantes.");
      return;
    }

    let audio: File | null = null;
    if (mode === "upload") {
      if (!file) {
        setError("Selecione um arquivo de áudio ou vídeo.");
        return;
      }
      audio = file;
    } else {
      if (!recordedBlob) {
        setError("Grave a reunião antes de enviar.");
        return;
      }
      audio = new File([recordedBlob], "gravacao.webm", { type: "audio/webm" });
    }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("clientName", clientName.trim());
    fd.append("source", mode === "record" ? "recording" : "upload");
    fd.append("consentConfirmed", "true");
    fd.append("file", audio);

    setSubmitting(true);
    try {
      const res = await api.createMeeting(fd);
      navigate(`/reuniao/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar.");
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <button
        onClick={() => navigate("/")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Nova reunião
      </h1>
      <p className="text-sm text-neutral-500">
        Envie um áudio ou grave a reunião. A IA transcreve e gera o relatório.
      </p>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
        {/* Coluna 1 — áudio */}
        <Card className="p-6">
          <h2 className="mb-3 font-bold text-neutral-900">
            1 · Como enviar o áudio
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <ModeCard
              active={mode === "upload"}
              onClick={() => setMode("upload")}
              icon={<IconUpload className="h-5 w-5" />}
              title="Upload de arquivo"
              desc="MP3, WAV, M4A ou MP4"
            />
            <ModeCard
              active={mode === "record"}
              onClick={() => setMode("record")}
              icon={<IconMic className="h-5 w-5" />}
              title="Gravar reunião"
              desc="Captura pelo microfone"
            />
          </div>

          {mode === "upload" && (
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 px-4 py-12 text-center transition hover:border-neutral-900 hover:bg-neutral-50">
              <input
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span className="text-sm font-semibold text-neutral-900">
                  {file.name}
                </span>
              ) : (
                <>
                  <IconUpload className="mb-1.5 h-6 w-6 text-neutral-400" />
                  <span className="text-sm font-semibold text-neutral-900">
                    Clique para escolher um arquivo
                  </span>
                  <span className="mt-0.5 text-xs text-neutral-400">
                    até 200 MB
                  </span>
                </>
              )}
            </label>
          )}

          {mode === "record" && (
            <div className="mt-4 rounded-2xl bg-neutral-50 p-6 text-center">
              <div className="text-4xl font-bold tabular-nums tracking-tight text-neutral-900">
                {formatClock(elapsed)}
              </div>
              <div className="mt-1 text-sm text-neutral-500">
                {recState === "idle" && "Pronto para gravar"}
                {recState === "recording" && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-rose-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" />
                    Gravando…
                  </span>
                )}
                {recState === "paused" && "Pausado"}
                {recState === "done" && "Gravação concluída"}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {recState === "idle" && (
                  <RecBtn onClick={startRecording} primary>
                    Iniciar gravação
                  </RecBtn>
                )}
                {recState === "recording" && (
                  <>
                    <RecBtn onClick={pauseRecording}>Pausar</RecBtn>
                    <RecBtn onClick={stopRecording} primary>
                      Finalizar
                    </RecBtn>
                  </>
                )}
                {recState === "paused" && (
                  <>
                    <RecBtn onClick={resumeRecording} primary>
                      Continuar
                    </RecBtn>
                    <RecBtn onClick={stopRecording}>Finalizar</RecBtn>
                  </>
                )}
                {recState === "done" && (
                  <RecBtn onClick={discardRecording}>
                    Descartar e regravar
                  </RecBtn>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-neutral-400">
                Captura o microfone deste dispositivo. Para uma call online,
                deixe o áudio da reunião tocando no alto-falante.
              </p>
            </div>
          )}
        </Card>

        {/* Coluna 2 — dados */}
        <Card className="space-y-5 p-6">
          <h2 className="font-bold text-neutral-900">2 · Dados da reunião</h2>

          <Input
            label="Título da reunião *"
            value={title}
            onChange={setTitle}
            placeholder="Ex: Call de proposta — Loja do João"
          />
          <Input
            label="Cliente / empresa"
            value={clientName}
            onChange={setClientName}
            placeholder="Opcional — agrupa na aba Clientes"
          />

          <label className="flex items-start gap-2.5 rounded-2xl bg-neutral-100 p-3.5 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-neutral-900"
            />
            <span>
              Confirmo que todos os participantes foram informados e
              autorizaram a gravação/análise desta reunião.
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting ? "Enviando…" : "Analisar reunião"}
          </button>

          <p className="text-center text-xs text-neutral-400">
            Em breve: assistente ao vivo e bot que entra automaticamente em
            Meet, Zoom e Teams.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
      }`}
    >
      {icon}
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p
        className={`mt-0.5 text-xs ${active ? "text-neutral-400" : "text-neutral-500"}`}
      >
        {desc}
      </p>
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
      />
    </label>
  );
}

function RecBtn({
  onClick,
  primary,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        primary
          ? "bg-neutral-900 text-white hover:bg-neutral-700"
          : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}
