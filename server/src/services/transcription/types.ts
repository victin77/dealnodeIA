/**
 * Contrato de qualquer provedor de transcricao.
 * Trocar Whisper por outro servico no futuro = criar um arquivo
 * que implemente esta interface e registrar no index.ts.
 */
export interface TranscriptionResult {
  /** Texto completo da transcricao. */
  text: string;
  /** Duracao do audio em segundos, quando o provedor informar. */
  durationSeconds: number | null;
}

export interface TranscriptionProvider {
  readonly name: string;
  transcribe(filePath: string): Promise<TranscriptionResult>;
}
