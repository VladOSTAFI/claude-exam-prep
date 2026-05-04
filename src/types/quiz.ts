export interface QuizChoice {
  id: string; // stable, e.g. "a" | "b" | "c" | "d"
  text: string;
}

export interface QuizQuestion {
  id: string; // unique within the quiz, e.g. "q1"
  prompt: string; // markdown-free plain text
  choices: QuizChoice[]; // exactly 4 expected, but type allows 2+
  correctChoiceId: string;
  explanation?: string; // shown after submission
}

export interface Quiz {
  slug: string; // matches the module slug
  title: string;
  questions: QuizQuestion[];
}

export interface QuizResult {
  score: number; // count of correct answers
  total: number; // total questions
  percentage: number; // 0-100, integer
  passed: boolean; // percentage >= 72
  perQuestion: {
    questionId: string;
    correct: boolean;
    selectedChoiceId: string | null;
  }[];
}

export type QuizState =
  | { status: "idle" }
  | { status: "answering"; answers: Record<string, string> }
  | { status: "submitted"; answers: Record<string, string>; result: QuizResult };

export type QuizAction =
  | { type: "select"; questionId: string; choiceId: string }
  | { type: "submit" }
  | { type: "retry" };
