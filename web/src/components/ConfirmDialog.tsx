import { useEffect, useRef } from "react";
import { IconTrash } from "./icons";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmação no estilo do app (substitui o confirm() do navegador). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fundo */}
      <div
        className="dn-overlay-in absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="dn-dialog-in relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <IconTrash className="h-6 w-6" />
        </div>

        <h3 className="text-center text-lg font-bold text-neutral-900">
          {title}
        </h3>
        <p className="mx-auto mt-1.5 max-w-xs text-center text-sm leading-relaxed text-neutral-500">
          {message}
        </p>

        <div className="mt-6 flex gap-2.5">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? "Excluindo…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
