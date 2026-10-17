export interface Concept {
  id: string;
  title: string;
  readingTime: string;
  taxonomy: string;
  summary: string;
  keyQuote: string;
  takeaway: string;
  subpoints: string[];
}

export type SRSInterval = 'Again (<10m)' | 'Hard (1d)' | 'Good (3d)' | 'Easy (7d)';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  srsInterval: SRSInterval;
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
  lastReviewed?: number;
  repetitionCount?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citationAnchor?: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  isFormula?: boolean;
  formula?: string;
  definition: string;
  contextInPaper: string;
  frequency: 'High' | 'Medium' | 'Foundational';
}

export interface AudioChapter {
  time: string;
  title: string;
}

export interface AudioBriefing {
  title: string;
  speaker: string;
  duration: string;
  audioScript: string;
  chapters: AudioChapter[];
}

export interface SourceExcerpt {
  section: string;
  content: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: 'core' | 'concept' | 'formula' | 'methodology' | 'finding' | 'challenge';
  description: string;
  quote?: string;
  formula?: string;
  taxonomy?: string;
  importance: number; // 1 to 5
  relatedConceptId?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: string;
  strength?: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface PaperData {
  id: string;
  title: string;
  shortTitle: string;
  authors: string[];
  venue: string;
  year: number;
  doi: string;
  citations: string;
  field: string;
  fieldTag: string;
  readingTimeMinutes: number;
  executiveSummary: {
    elevatorPitch: string;
    problemStatement: string;
    coreInnovation: string;
    methodologyPipeline: string[];
    keyFindings: string[];
    limitationsAndCritique: string[];
    futureDirections: string[];
  };
  concepts: Concept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  vocabularyAndFormulas: VocabularyItem[];
  audioBriefing: AudioBriefing;
  sourceExcerpts: SourceExcerpt[];
  knowledgeGraph?: KnowledgeGraphData;
  studyKit?: import('./studyKit').StudyKitResponse;
}

export type StudyTab = 
  | 'studykit'
  | 'summary' 
  | 'concepts' 
  | 'graph'
  | 'flashcards' 
  | 'quiz' 
  | 'vocabulary' 
  | 'source';


