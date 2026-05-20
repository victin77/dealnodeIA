// Tipos compartilhados com o backend (espelham server/src/services/analysis/types.ts)

export interface User {
  id: string;
  name: string;
  email: string;
}

export type MeetingStatus =
  | "created"
  | "transcribing"
  | "analyzing"
  | "ready"
  | "error";

export interface MeetingSummary {
  id: string;
  title: string;
  clientName: string | null;
  source: "upload" | "recording";
  status: MeetingStatus;
  durationSeconds: number | null;
  closingScore: number | null;
  createdAt: string;
}

export interface Stats {
  total: number;
  ready: number;
  processing: number;
  avgClosingScore: number | null;
}

export interface MeetingContext {
  meetingType: string;
  sector: string;
  whatIsBeingSold: string;
  salesStage: string;
  participants: { name: string; role: string }[];
  language: string;
}

export interface ReportContent {
  executiveSummary: string;
  closingScore: { value: number; reasoning: string };
  topics: string[];
  clientPains: string[];
  solutionsDiscussed: string[];
  objections: { objection: string; suggestedResponse: string }[];
  questionsAnswers: { question: string; answer: string }[];
  openQuestions: string[];
  decisions: string[];
  nextSteps: { task: string; owner: string | null; deadline: string | null }[];
  risks: string[];
  commercialInsights: {
    interestLevel: string;
    bestArgument: string;
    notes: string;
  };
  followUpMessage: string;
  sellerCoaching: {
    talkRatioNote: string;
    strengths: string[];
    improvements: string[];
  };
}

export interface MeetingDetail {
  id: string;
  title: string;
  clientName: string | null;
  source: "upload" | "recording";
  status: MeetingStatus;
  transcript: string | null;
  durationSeconds: number | null;
  consentConfirmed: boolean;
  errorMessage: string | null;
  folderId: string | null;
  createdAt: string;
  report: {
    context: MeetingContext;
    content: ReportContent;
    closingScore: number | null;
  } | null;
}

export interface Folder {
  id: string;
  name: string;
  meetingCount: number;
  createdAt: string;
}

export interface FolderDetail {
  folder: { id: string; name: string; createdAt: string };
  meetings: MeetingSummary[];
}

export interface InsightRef {
  text: string;
  meetingId: string;
  meetingTitle: string;
}

export interface Insights {
  totalAnalyzed: number;
  avgScore: number | null;
  bestScore: number | null;
  scoreTimeline: { id: string; title: string; date: string; score: number }[];
  interestDistribution: { alto: number; medio: number; baixo: number };
  objections: InsightRef[];
  improvements: InsightRef[];
}

export interface Health {
  ok: boolean;
  transcription: string;
  analysis: string;
}
