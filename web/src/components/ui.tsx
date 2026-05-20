import type { ReactNode } from "react";

/** Container padrão das páginas — preenche bem telas largas. */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1700px] px-5 py-6 sm:px-8 sm:py-7">
      {children}
    </div>
  );
}

/** Cartão branco arredondado padrão. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Cabeçalho de página: título grande + subtítulo. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Botão preto principal. */
export function Button({
  children,
  onClick,
  disabled,
  type = "button",
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  full?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-200 border-t-neutral-900" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-medium text-neutral-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-neutral-400">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
