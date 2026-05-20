import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

/** Recebe só o ponto do clique — origem da animação circular. */
type ClickOrigin = { clientX: number; clientY: number };

interface ThemeState {
  theme: Theme;
  toggle: (origin: ClickOrigin) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const STORAGE_KEY = "dealnote_theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light"
  );

  // Garante o estado inicial (idempotente com o script do index.html).
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle(origin: ClickOrigin) {
    const next: Theme = theme === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next);

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    // Sem suporte a View Transitions: troca direto.
    if (!doc.startViewTransition) {
      applyTheme(next);
      setTheme(next);
      return;
    }

    const { clientX: x, clientY: y } = origin;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      // Aplica a classe .dark de forma SÍNCRONA, antes do navegador
      // capturar o snapshot do novo tema — é isso que evita a piscada.
      applyTheme(next);
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme precisa estar dentro de ThemeProvider.");
  return ctx;
}
