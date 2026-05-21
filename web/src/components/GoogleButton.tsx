import { useEffect, useRef } from "react";

// ID do cliente OAuth do Google — não é secreto (vai no frontend mesmo).
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "793973236663-dp8o9q0m8jvdeqv76jkm5t2ge03vf26c.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            el: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface Props {
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}

/** Botão oficial "Continuar com Google" (Google Identity Services). */
export function GoogleButton({ onCredential, onError }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Mantém os callbacks atuais sem re-rodar o efeito (renderiza o botão 1x).
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };

  useEffect(() => {
    let cancelled = false;

    function tryRender(): boolean {
      const g = window.google;
      if (!g || !ref.current) return false;

      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp: { credential?: string }) => {
          if (resp.credential) handlers.current.onCredential(resp.credential);
          else handlers.current.onError("Não foi possível entrar com o Google.");
        },
      });
      g.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 300,
      });
      return true;
    }

    // O script do Google carrega de forma assíncrona — tenta até estar pronto.
    if (tryRender()) return;
    const timer = setInterval(() => {
      if (cancelled) return;
      if (tryRender()) clearInterval(timer);
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return <div ref={ref} className="flex min-h-[44px] justify-center" />;
}
