export interface VocabularyEntry {
  word: string;
  romanUrduMeaning: string;
  contextualExplanation: string;
  sourceContext?: string;
}

export interface ExamQuestion {
  question: string;
  answer: string;
  type: 'conceptual' | 'methodology' | 'findings' | 'implications' | 'critical_thinking';
}

export interface StudyKitResponse {
  paperTitle: string;
  englishSummary: string;
  romanUrduSummary: string;
  vocabulary: VocabularyEntry[];
  questions: ExamQuestion[];
  limitations: string[];
  wordCount: number;
  generatedAt: string;
  sourceType: 'text' | 'pdf';
  fileName?: string;
}

export interface StudyKitRequest {
  text?: string;
  pdfBase64?: string;
  fileName?: string;
  field?: string;
}
