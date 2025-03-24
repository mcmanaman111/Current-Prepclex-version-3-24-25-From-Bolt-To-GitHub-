// Add these types to the existing exam.ts file

export interface ClientNeedsData {
  [area: string]: {
    correct: number;
    total: number;
    topics: {
      [topic: string]: {
        correct: number;
        total: number;
      };
    };
  };
}

export interface TestResultsData {
  testId: string;
  questions: Question[];
  scores: Record<string, Score>;
  markedQuestions: number[];
  startTime: string;
  endTime: string;
  elapsedTime: string;
}