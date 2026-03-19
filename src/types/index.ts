export interface Module {
  slug: string;
  title: string;
  domain: number;
  weight: number;
  taskStatements: number;
  description: string;
  content: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  depth: number;
}

export interface Question {
  id: number;
  domain: string;
  domainNumber: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scenario: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface TestSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  questions: Question[];
  answers: Record<number, string>;
  flagged: number[];
  timeLimit: number;
}

export interface UserProgress {
  modulesRead: Record<string, {
    completed: boolean;
    lastRead: string;
    sectionsRead: string[];
  }>;
  testSessions: TestSession[];
  bookmarkedQuestions: number[];
}
