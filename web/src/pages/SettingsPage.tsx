import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Health } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { Card, PageContainer, PageHeader, Button } from "../components/ui";

const PROVIDER_LABEL: Record<string, string> = {
  groq: "Groq — gratuito",
  openai: "OpenAI",
  mock: "Modo demonstração (dados de exemplo)",
};

export function SettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        subtitle="Sua conta e o motor de IA do sistema."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Perfil */}
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-neutral-900">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-900 text-xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{user?.name}</p>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* IA */}
        <Card className="p-6">
          <h2 className="mb-4 font-bold text-neutral-900">
            Inteligência artificial
          </h2>
          <div className="space-y-3">
            <ProviderRow
              label="Transcrição"
              value={
                health
                  ? (PROVIDER_LABEL[health.transcription] ??
                    health.transcription)
                  : "—"
              }
            />
            <ProviderRow
              label="Análise"
              value={
                health
                  ? (PROVIDER_LABEL[health.analysis] ?? health.analysis)
                  : "—"
              }
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            O provedor é definido no arquivo <code>server/.env</code>. Sem chave
            de API, o sistema roda em modo demonstração.
          </p>
        </Card>

        {/* Senha */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold text-neutral-900">Trocar senha</h2>
          <ChangePasswordForm />
        </Card>
      </div>
    </PageContainer>
  );
}

function ProviderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 6) {
      setMsg({ ok: false, text: "A nova senha precisa ter ao menos 6 caracteres." });
      return;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: "A confirmação não confere com a nova senha." });
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(current, next);
      setMsg({ ok: true, text: "Senha alterada com sucesso." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Falha ao trocar a senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
      <PwInput label="Senha atual" value={current} onChange={setCurrent} />
      <PwInput label="Nova senha" value={next} onChange={setNext} />
      <PwInput label="Confirmar nova senha" value={confirm} onChange={setConfirm} />

      {msg && (
        <p
          className={`rounded-xl px-3 py-2 text-sm sm:col-span-3 ${
            msg.ok
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="sm:col-span-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </div>
    </form>
  );
}

function PwInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder="••••••••"
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:bg-white"
      />
    </label>
  );
}
