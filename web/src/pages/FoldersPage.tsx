import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Folder } from "../lib/types";
import {
  Card,
  PageContainer,
  PageHeader,
  Spinner,
  EmptyState,
  Button,
} from "../components/ui";
import { FolderShape } from "../components/FolderShape";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconTrash } from "../components/icons";

export function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<Folder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.listFolders();
      setFolders(res.folders);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as pastas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setNewName("");
    setCreateError(null);
    setCreating(true);
  }

  async function handleCreate() {
    if (newName.trim().length < 1) {
      setCreateError("Dê um nome à pasta.");
      return;
    }
    setSaving(true);
    setCreateError(null);
    try {
      await api.createFolder(newName.trim());
      setCreating(false);
      await load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Falha ao criar.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteFolder(toDelete.id);
      setToDelete(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Pastas"
        subtitle="Organize suas reuniões em pastas."
        action={<Button onClick={openCreate}>+ Nova pasta</Button>}
      />

      {loading ? (
        <Card>
          <Spinner />
        </Card>
      ) : loadError ? (
        <Card>
          <EmptyState
            title="Não foi possível carregar as pastas"
            hint={loadError}
            action={<Button onClick={load}>Tentar de novo</Button>}
          />
        </Card>
      ) : folders.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma pasta ainda"
            hint="Crie uma pasta para agrupar suas reuniões."
            action={<Button onClick={openCreate}>+ Nova pasta</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {folders.map((f) => (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/pastas/${f.id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/pastas/${f.id}`)}
              className="group relative cursor-pointer rounded-3xl bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition hover:shadow-md"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToDelete(f);
                }}
                title="Excluir pasta"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-300 opacity-0 transition hover:bg-neutral-100 hover:text-neutral-700 group-hover:opacity-100"
              >
                <IconTrash className="h-4 w-4" />
              </button>

              <FolderShape className="mx-auto block h-24" />
              <p className="mt-3 truncate font-semibold text-neutral-900">
                {f.name}
              </p>
              <p className="text-sm text-neutral-400">
                {f.meetingCount}{" "}
                {f.meetingCount === 1 ? "reunião" : "reuniões"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal: nova pasta */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="dn-overlay-in absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !saving && setCreating(false)}
          />
          <div className="dn-dialog-in relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900">Nova pasta</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Dê um nome para organizar suas reuniões.
            </p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Ex: Clientes 2026"
              className="mt-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:bg-white"
            />
            {createError && (
              <p className="mt-2 text-sm text-rose-600">{createError}</p>
            )}
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setCreating(false)}
                disabled={saving}
                className="flex-1 rounded-xl bg-neutral-100 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                {saving ? "Criando…" : "Criar pasta"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir pasta?"
        message={`A pasta "${toDelete?.name ?? ""}" será excluída. As reuniões dentro dela NÃO são apagadas — apenas saem da pasta.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </PageContainer>
  );
}
