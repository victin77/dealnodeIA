/**
 * Gráfico de pasta (formato de folder) usado nos cards da aba Pastas.
 * Duas camadas em cinza para dar um leve volume; acompanha o tema.
 */
export function FolderShape({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 52"
      className={className}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* aba + corpo de trás */}
      <path
        d="M4 16 Q4 9 11 9 L24 9 Q27 9 29 12 L31 15 L55 15 Q60 15 60 20 L60 43 Q60 48 55 48 L9 48 Q4 48 4 43 Z"
        fill="var(--color-neutral-300)"
      />
      {/* frente da pasta */}
      <path
        d="M4 24 L60 24 L60 43 Q60 48 55 48 L9 48 Q4 48 4 43 Z"
        fill="var(--color-neutral-200)"
      />
    </svg>
  );
}
