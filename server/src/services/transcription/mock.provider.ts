import { TranscriptionProvider, TranscriptionResult } from "./types";

/**
 * Provedor de exemplo: usado quando nao ha OPENAI_API_KEY.
 * Devolve uma transcricao ficticia para o fluxo do app rodar de ponta a ponta.
 */
export class MockTranscriptionProvider implements TranscriptionProvider {
  readonly name = "mock";

  async transcribe(_filePath: string): Promise<TranscriptionResult> {
    await new Promise((r) => setTimeout(r, 800)); // simula processamento

    const text = [
      "Vendedor: Oi Marina, obrigado pelo tempo hoje. Voce comentou que a equipe de vendas esta perdendo tempo com relatorio manual depois das reunioes.",
      "Cliente: Exato. Cada vendedor gasta umas duas horas por dia escrevendo resumo e follow-up. E muita coisa se perde.",
      "Vendedor: Entendi. O DealNote gera o resumo, as objecoes e ja monta o follow-up automaticamente. Quanto isso representaria pro time?",
      "Cliente: Se economizar mesmo essas duas horas, seria enorme. Mas confesso que achei o preco um pouco alto.",
      "Vendedor: Faz sentido. Posso te mostrar o calculo de retorno? Considerando o custo da hora do vendedor, o sistema se paga na primeira semana.",
      "Cliente: Isso ajuda. Preciso alinhar com meu socio antes de fechar, mas gostei bastante.",
      "Vendedor: Perfeito. Te mando uma proposta hoje e marcamos uma call com ele na proxima terca?",
      "Cliente: Pode ser. Manda a proposta que eu encaminho pra ele.",
    ].join("\n");

    return { text, durationSeconds: 372 };
  }
}
