export interface Topic {
  id: string;
  name: string;
  count: number;
  selected?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  topicCount: number;
  topics?: Topic[];
  selected?: boolean;
}

export interface QuestionType {
  id: string;
  label: string;
  count: number;
}

export interface TestConfig {
  tutorMode: boolean;
  timer: boolean;
  ngn: boolean;
  questionCount: number;
}