import { AnalysisProvider, AnalysisResult } from "./types";

/**
 * Analise de exemplo: usada quando nao ha OPENAI_API_KEY.
 * Devolve um relatorio realista para o app rodar de ponta a ponta sem custo.
 */
export class MockAnalysisProvider implements AnalysisProvider {
  readonly name = "mock";

  async analyze(_transcript: string): Promise<AnalysisResult> {
    await new Promise((r) => setTimeout(r, 1000)); // simula processamento

    return {
      context: {
        meetingType: "negociacao",
        sector: "SaaS B2B / produtividade de vendas",
        whatIsBeingSold: "Software que gera resumo e follow-up de reunioes comerciais",
        salesStage: "negociacao",
        participants: [
          { name: "Vendedor", role: "Representante comercial" },
          { name: "Marina", role: "Cliente / gestora de vendas" },
        ],
        language: "portugues",
      },
      report: {
        executiveSummary:
          "Call de negociacao com a Marina, gestora de vendas. O objetivo era avancar para a proposta. O cliente demonstrou dor clara (2h/dia perdidas com relatorio manual), reagiu a preco mas aceitou ver o calculo de ROI. Ficou definido envio de proposta e call com o socio.",
        closingScore: {
          value: 72,
          reasoning:
            "Sinais de compra fortes: dor quantificada, pedido de proposta e abertura para reuniao com o decisor. Risco: objecao de preco ainda nao 100% resolvida e a decisao depende de um socio que nao estava na call.",
        },
        topics: [
          "Tempo perdido com relatorio manual pos-reuniao",
          "Geracao automatica de resumo e follow-up",
          "Preco e retorno sobre investimento",
          "Proximos passos com o socio",
        ],
        clientPains: [
          "Cada vendedor gasta cerca de 2h por dia escrevendo resumo e follow-up",
          "Informacao importante das reunioes se perde",
        ],
        solutionsDiscussed: [
          "DealNote gera resumo, objecoes e follow-up automaticamente",
          "Apresentar calculo de ROI baseado no custo da hora do vendedor",
        ],
        objections: [
          {
            objection: "Achei o preco um pouco alto",
            suggestedResponse:
              "Reposicionar de custo para investimento: mostrar que, ao recuperar 2h/dia por vendedor, o sistema se paga na primeira semana. Enviar o calculo de ROI por escrito junto da proposta.",
          },
        ],
        questionsAnswers: [
          {
            question: "Quanto isso representaria pro time?",
            answer:
              "Economia de cerca de 2h/dia por vendedor, considerada enorme pela cliente.",
          },
        ],
        openQuestions: [
          "O socio vai aprovar o investimento?",
          "Quantos vendedores entrariam na licenca?",
        ],
        decisions: [
          "Vendedor envia a proposta ainda hoje",
          "Marina encaminha a proposta para o socio",
        ],
        nextSteps: [
          { task: "Enviar proposta comercial", owner: "Vendedor", deadline: "hoje" },
          {
            task: "Agendar call com o socio para apresentar o ROI",
            owner: "Vendedor",
            deadline: "proxima terca",
          },
        ],
        risks: [
          "Objecao de preco ainda nao totalmente superada",
          "Decisao final depende de um socio ausente na call",
        ],
        commercialInsights: {
          interestLevel: "alto",
          bestArgument:
            "Recuperar 2h/dia por vendedor: o sistema se paga na primeira semana de uso.",
          notes:
            "Negocio quente, mas com decisao compartilhada. Garantir presenca do socio na proxima call e levar o ROI por escrito.",
        },
        followUpMessage:
          "Oi Marina! Foi otimo conversar hoje. Acabei de te enviar a proposta com o calculo de retorno que comentei: considerando as 2h/dia por vendedor, o DealNote se paga ja na primeira semana. Quando puder, me confirma o melhor dia pra gente alinhar rapidinho com seu socio. Fico no aguardo! 🙌",
        sellerCoaching: {
          talkRatioNote:
            "Equilibrio razoavel: o vendedor fez boas perguntas abertas e deixou a cliente expor a dor antes de apresentar a solucao.",
          strengths: [
            "Quantificou a dor do cliente (2h/dia) antes de falar de preco",
            "Reagiu a objecao de preco com proposta de valor, sem dar desconto",
          ],
          improvements: [
            "Confirmar quem mais participa da decisao logo no inicio da call",
            "Fechar a objecao de preco na propria call, nao deixar para a proposta",
          ],
        },
      },
    };
  }
}
