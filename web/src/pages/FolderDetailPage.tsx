import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { FolderDetail } from "../lib/types";
import { Card, PageContainer, Spinner, EmptyState } from "../components/ui";
import { MeetingRow } from "../components/MeetingRow";
import { IconArrowLeft } from "../components/icons";

const PROCESSING = ["created", "transcribing", "analyzing"];

export function FolderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FolderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.getFolder(id);
      setData(res);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Atualiza enquanto houver reunião em processamento.
  useEffect(() => {
    if (!data) return;
    const processing = data.meetings.some((m) =>
      PROCESSING.includes(m.status)
    );
    if (!processing) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [data, load]);

  return (
    <PageContainer>
      <button
        onClick={() => navigate("/pastas")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Pastas
      </button>

      {loading ? (
        <Card>
          <Spinner />
        </Card>
      ) : notFound || !data ? (
        <Card className="p-10 text-center text-neutral-500">
          Pasta não encontrada.
        </Card>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {data.folder.name}
          </h1>
          <p className="mb-5 text-sm text-neutral-500">
            {data.meetings.length}{" "}
            {data.meetings.length === 1 ? "reunião" : "reuniões"}
          </p>

          <Card className="p-3">
            {data.meetings.length === 0 ? (
              <EmptyState
                title="Pasta vazia"
                hint="Abra o relatório de uma reunião e escolha esta pasta para adicioná-la aqui."
              />
            ) : (
              <div className="grid gap-x-4 gap-y-0.5 lg:grid-cols-2">
                {data.meetings.map((m) => (
                  <MeetingRow key={m.id} meeting={m} />
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </PageContainer>
  );
}
