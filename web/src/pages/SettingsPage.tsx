import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Health } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  PageContainer,
  PageHeader,
  Button,
  PasswordInput,
} from "../components/ui";

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
          <h2 className="mb-1 font-bold text-neutral-900">
            {user?.hasPassword ? "Trocar senha" : "Criar senha"}
          </h2>
          <p className="mb-4 text-sm text-neutral-500">
            {user?.hasPassword
              ? "Atualize a senha de acesso à sua conta."
              : "Sua conta entra com o Google. Crie uma senha para também poder entrar com e-mail e senha."}
          </p>
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
  const { user, changePassword } = useAuth();
  const hasPassword = user?.hasPassword ?? false;

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 6) {
      setMsg({ ok: false, text: "A senha precisa ter ao menos 6 caracteres." });
      return;
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: "A confirmação não confere com a senha." });
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, next);
      setMsg({
        ok: true,
        text: hasPassword
          ? "Senha alterada com sucesso."
          : "Senha criada! Agora você também pode entrar com e-mail e senha.",
      });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Falha ao salvar a senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  // 3 colunas quando ha campo de senha atual; 2 colunas no modo "criar senha".
  const span = hasPassword ? "sm:col-span-3" : "sm:col-span-2";

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-3 ${hasPassword ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
    >
      {hasPassword && (
        <PasswordInput
          label="Senha atual"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
      )}
      <PasswordInput
        label="Nova senha"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
      />
      <PasswordInput
        label="Confirmar nova senha"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
      />

      {msg && (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${span} ${
            msg.ok
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className={span}>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Salvando…"
            : hasPassword
              ? "Salvar nova senha"
              : "Criar senha"}
        </Button>
      </div>
    </form>
  );
}

