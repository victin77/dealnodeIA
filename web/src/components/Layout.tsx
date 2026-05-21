import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { MouseEvent, ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavMode } from "../context/NavModeContext";
import {
  IconChart,
  IconClock,
  IconClose,
  IconFolder,
  IconGear,
  IconHome,
  IconLogout,
  IconMenu,
  IconMoon,
  IconPlus,
  IconSun,
  IconUsers,
} from "./icons";

const NAV = [
  { to: "/", label: "Início", Icon: IconHome },
  { to: "/nova", label: "Nova reunião", Icon: IconPlus },
  { to: "/historico", label: "Histórico", Icon: IconClock },
  { to: "/pastas", label: "Pastas", Icon: IconFolder },
  { to: "/clientes", label: "Clientes", Icon: IconUsers },
  { to: "/desempenho", label: "Desempenho", Icon: IconChart },
  { to: "/config", label: "Configurações", Icon: IconGear },
];

/* Botão da sidebar (desktop) — com rótulo em tooltip no hover. */
function SideButton({
  onClick,
  label,
  children,
  active,
}: {
  onClick?: (e: MouseEvent) => void;
  label: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl transition ${
        active
          ? "bg-[#fafafa] text-[#161616]"
          : "text-[#8b8b8b] hover:bg-[#ffffff14] hover:text-[#fafafa]"
      }`}
    >
      {children}
      <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-lg bg-[#2e2e2e] px-2.5 py-1.5 text-xs font-medium text-[#fafafa] opacity-0 shadow-lg transition group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

/* Botão de ícone da barra superior (mobile). */
function TopButton({
  onClick,
  label,
  children,
}: {
  onClick: (e: MouseEvent) => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-xl text-[#8b8b8b] transition hover:bg-[#ffffff14] hover:text-[#fafafa]"
    >
      {children}
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { navMode } = useNavMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const themeLabel = theme === "light" ? "Modo escuro" : "Modo claro";
  const ThemeIcon = theme === "light" ? IconMoon : IconSun;

  // Fecha o menu lateral com a tecla Esc.
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex h-dvh">
      {/* === Sidebar — só no desktop (md+) === */}
      <aside className="my-3 ml-3 hidden w-[72px] shrink-0 flex-col items-center rounded-3xl bg-[#161616] py-5 md:flex">
        <span
          className="logo-mark mb-7 block h-10 w-10 bg-[#fafafa]"
          role="img"
          aria-label="DealNote AI"
        />

        <nav className="flex flex-1 flex-col gap-2">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end className="contents">
              {({ isActive }) => (
                <SideButton label={label} active={isActive}>
                  <Icon className="h-[22px] w-[22px]" />
                </SideButton>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <SideButton label={themeLabel} onClick={(e) => toggle(e)}>
            <ThemeIcon className="h-[22px] w-[22px]" />
          </SideButton>
          <SideButton
            label={`Sair (${user?.name?.split(" ")[0] ?? ""})`}
            onClick={handleLogout}
          >
            <IconLogout className="h-[22px] w-[22px]" />
          </SideButton>
        </div>
      </aside>

      {/* === Coluna principal === */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior — só no mobile (< md) */}
        <header className="flex shrink-0 items-center justify-between bg-[#161616] px-2 pb-2.5 pt-[calc(0.625rem_+_env(safe-area-inset-top))] shadow-sm md:hidden">
          <div className="flex items-center">
            {navMode === "drawer" && (
              <TopButton
                label="Abrir menu"
                onClick={() => setDrawerOpen(true)}
              >
                <IconMenu className="h-5 w-5" />
              </TopButton>
            )}
            <div className="flex items-center gap-2 px-2">
              <span
                className="logo-mark block h-7 w-7 bg-[#fafafa]"
                role="img"
                aria-label="DealNote AI"
              />
              <span className="font-semibold text-[#fafafa]">DealNote AI</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <TopButton label={themeLabel} onClick={(e) => toggle(e)}>
              <ThemeIcon className="h-5 w-5" />
            </TopButton>
            <TopButton label="Sair" onClick={handleLogout}>
              <IconLogout className="h-5 w-5" />
            </TopButton>
          </div>
        </header>

        {/* Conteúdo — anima a cada troca de aba.
           No modo "abas", reserva espaço inferior para a barra fixa. */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div
            key={location.pathname}
            className={`dn-page-in md:pb-0 ${
              navMode === "tabs"
                ? "pb-[calc(5.5rem_+_env(safe-area-inset-bottom))]"
                : ""
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* === Barra de navegação inferior — mobile, modo "abas" === */}
      {navMode === "tabs" && (
        <nav
          aria-label="Navegação"
          className="fixed inset-x-0 bottom-0 z-30 flex justify-around bg-[#161616] px-1 pt-1.5 pb-[calc(0.375rem_+_env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.18)] md:hidden"
        >
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              aria-label={label}
              className="flex flex-1 items-center justify-center py-0.5"
            >
              {({ isActive }) => (
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition ${
                    isActive
                      ? "bg-[#fafafa] text-[#161616]"
                      : "text-[#8b8b8b]"
                  }`}
                >
                  <Icon className="h-[22px] w-[22px]" />
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* === Menu lateral (hambúrguer) — mobile, modo "drawer" === */}
      {navMode === "drawer" && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
              drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col bg-[#161616] shadow-2xl transition-transform duration-300 md:hidden ${
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-[calc(1rem_+_env(safe-area-inset-top))]">
              <div className="flex items-center gap-2">
                <span
                  className="logo-mark block h-7 w-7 bg-[#fafafa]"
                  role="img"
                  aria-label="DealNote AI"
                />
                <span className="font-semibold text-[#fafafa]">
                  DealNote AI
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                className="grid h-9 w-9 place-items-center rounded-xl text-[#8b8b8b] transition hover:bg-[#ffffff14] hover:text-[#fafafa]"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
              {NAV.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#fafafa] text-[#161616]"
                        : "text-[#bdbdbd] hover:bg-[#ffffff14] hover:text-[#fafafa]"
                    }`
                  }
                >
                  <Icon className="h-[22px] w-[22px] shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
