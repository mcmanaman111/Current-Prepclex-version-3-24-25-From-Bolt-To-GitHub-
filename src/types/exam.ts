export interface Score {
  correct: number;
  total: number;
  incorrect: number;
  isFullyCorrect: boolean;
  nclexScore: number;
  percentage: number;
}

export interface TestQuestion {
  id: number;
  question_text: string;
  choices: { text: string; isCorrect: boolean }[];
  explanation: string;
  references?: string | string[];  // Legacy field
  ref_sources?: string | string[]; // Primary field that matches the database column
  topic: string;
  sub_topic: string;
  topic_id: number;
  sub_topic_id: number;
  question_type: string;
  difficulty: string;
  ngn: boolean;
  time_taken?: string;
}
