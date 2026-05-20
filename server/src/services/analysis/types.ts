/**
 * Passada 1 - Triagem.
 * A IA le a transcricao e identifica sozinha o contexto da call.
 * E isso que torna a analise adaptativa (atende qualquer nicho).
 */
export interface MeetingContext {
  /** Ex: descoberta, demonstracao, negociacao, follow-up, fechamento, suporte. */
  meetingType: string;
  /** Setor/nicho detectado. Ex: agencia de marketing, imobiliaria, SaaS B2B. */
  sector: string;
  /** O que esta sendo vendido/discutido, em uma frase. */
  whatIsBeingSold: string;
  /** Estagio do funil de vendas detectado. */
  salesStage: string;
  /** Participantes detectados e seus papeis prováveis. */
  participants: { name: string; role: string }[];
  /** Idioma predominante da call. */
  language: string;
}

export interface Objection {
  objection: string;
  suggestedResponse: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface NextStep {
  task: string;
  owner: string | null;
  deadline: string | null;
}

export interface ClosingScore {
  /** 0 a 100. */
  value: number;
  reasoning: string;
}

export interface CommercialInsights {
  /** Ex: alto, medio, baixo. */
  interestLevel: string;
  bestArgument: string;
  notes: string;
}

export interface SellerCoaching {
  talkRatioNote: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Passada 2 - Relatorio completo.
 * Estrutura fixa, mas o conteudo se adapta ao MeetingContext da passada 1.
 */
export interface ReportContent {
  executiveSummary: string;
  closingScore: ClosingScore;
  topics: string[];
  clientPains: string[];
  solutionsDiscussed: string[];
  objections: Objection[];
  questionsAnswers: QuestionAnswer[];
  openQuestions: string[];
  decisions: string[];
  nextSteps: NextStep[];
  risks: string[];
  commercialInsights: CommercialInsights;
  /** Mensagem pronta para colar no WhatsApp. */
  followUpMessage: string;
  sellerCoaching: SellerCoaching;
}

export interface AnalysisResult {
  context: MeetingContext;
  report: ReportContent;
}

export interface AnalysisProvider {
  readonly name: string;
  analyze(transcript: string): Promise<AnalysisResult>;
}
