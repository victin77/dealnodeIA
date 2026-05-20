import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { MouseEvent, ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  IconChart,
  IconClock,
  IconFolder,
  IconGear,
  IconHome,
  IconLogout,
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

/* A sidebar usa cores fixas (literais): fica escura nos dois temas. */
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

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Sidebar flutuante (sempre escura) */}
      <aside className="my-3 ml-3 flex w-[72px] shrink-0 flex-col items-center rounded-3xl bg-[#161616] py-5">
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
          <SideButton
            label={theme === "light" ? "Modo escuro" : "Modo claro"}
            onClick={(e) => toggle(e)}
          >
            {theme === "light" ? (
              <IconMoon className="h-[22px] w-[22px]" />
            ) : (
              <IconSun className="h-[22px] w-[22px]" />
            )}
          </SideButton>

          <SideButton
            label={`Sair (${user?.name?.split(" ")[0] ?? ""})`}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <IconLogout className="h-[22px] w-[22px]" />
          </SideButton>
        </div>
      </aside>

      {/* Conteúdo — anima a cada troca de aba */}
      <main className="flex-1 overflow-y-auto">
        <div key={location.pathname} className="dn-page-in">
          {children}
        </div>
      </main>
    </div>
  );
}
