import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleButton } from "../components/GoogleButton";
import { Logo } from "../components/Logo";
import { PasswordInput } from "../components/ui";

export function LoginPage() {
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha no login com Google."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen p-3">
      {/* Painel preto de apresentação */}
      <div className="hidden w-1/2 flex-col justify-between rounded-3xl bg-neutral-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <Logo className="h-10 w-auto" />
          <span className="font-semibold text-white">DealNote AI</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white">
            Não é um gravador
            <br />
            de reunião.
            <br />
            <span className="text-neutral-500">
              É um copiloto de fechamento.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-400">
            Transcreve suas calls comerciais e entrega o que importa: score de
            fechamento, objeções com resposta pronta, follow-up de WhatsApp e
            coaching de vendas — adaptado ao seu nicho automaticamente.
          </p>
        </div>
        <p className="text-xs text-neutral-600">
          Transcrição e análise com IA · MVP
        </p>
      </div>

      {/* Formulário */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <Logo className="h-9 w-auto" />
            <span className="font-semibold text-neutral-900">DealNote AI</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {mode === "login"
              ? "Acesse seu painel de reuniões."
              : "Comece a analisar suas calls comerciais."}
          </p>

          <div className="mt-6">
            <GoogleButton onCredential={handleGoogle} onError={setError} />
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">ou</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Field label="Nome" type="text" value={name} onChange={setName} placeholder="Seu nome" />
            )}
            <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@empresa.com" />
            <PasswordInput
              label="Senha"
              value={password}
              onChange={setPassword}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />

            {error && (
              <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
            >
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            {mode === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
            >
              {mode === "login" ? "Criar agora" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
      />
    </label>
  );
}
