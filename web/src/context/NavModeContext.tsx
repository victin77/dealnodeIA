import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/** Como o usuário navega no celular. */
export type NavMode = "tabs" | "drawer";

interface NavModeState {
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
}

const NavModeContext = createContext<NavModeState | null>(null);
const STORAGE_KEY = "dealnote_navmode";

export function NavModeProvider({ children }: { children: ReactNode }) {
  const [navMode, setMode] = useState<NavMode>(() =>
    localStorage.getItem(STORAGE_KEY) === "drawer" ? "drawer" : "tabs"
  );

  function setNavMode(mode: NavMode) {
    localStorage.setItem(STORAGE_KEY, mode);
    setMode(mode);
  }

  return (
    <NavModeContext.Provider value={{ navMode, setNavMode }}>
      {children}
    </NavModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavMode(): NavModeState {
  const ctx = useContext(NavModeContext);
  if (!ctx) {
    throw new Error("useNavMode precisa estar dentro de NavModeProvider.");
  }
  return ctx;
}
