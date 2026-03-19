import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, TestSession, UserProgress } from '@/types';
import { generateId } from '@/lib/utils';

interface AppStore {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Module Progress
  progress: UserProgress;
  markSectionRead: (moduleSlug: string, sectionId: string) => void;
  markModuleComplete: (moduleSlug: string) => void;

  // Test State
  currentTest: TestSession | null;
  startTest: (questions: Question[], timeLimit: number) => void;
  answerQuestion: (questionId: number, answer: string) => void;
  flagQuestion: (questionId: number) => void;
  submitTest: () => void;

  // Bookmarks
  toggleBookmark: (questionId: number) => void;
}

const initialProgress: UserProgress = {
  modulesRead: {},
  testSessions: [],
  bookmarkedQuestions: [],
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      // Module Progress
      progress: initialProgress,

      markSectionRead: (moduleSlug: string, sectionId: string) =>
        set((state) => {
          const moduleProgress = state.progress.modulesRead[moduleSlug] || {
            completed: false,
            lastRead: new Date().toISOString(),
            sectionsRead: [],
          };

          const sectionsRead = moduleProgress.sectionsRead.includes(sectionId)
            ? moduleProgress.sectionsRead
            : [...moduleProgress.sectionsRead, sectionId];

          return {
            progress: {
              ...state.progress,
              modulesRead: {
                ...state.progress.modulesRead,
                [moduleSlug]: {
                  ...moduleProgress,
                  lastRead: new Date().toISOString(),
                  sectionsRead,
                },
              },
            },
          };
        }),

      markModuleComplete: (moduleSlug: string) =>
        set((state) => {
          const moduleProgress = state.progress.modulesRead[moduleSlug] || {
            completed: false,
            lastRead: new Date().toISOString(),
            sectionsRead: [],
          };

          return {
            progress: {
              ...state.progress,
              modulesRead: {
                ...state.progress.modulesRead,
                [moduleSlug]: {
                  ...moduleProgress,
                  completed: true,
                  lastRead: new Date().toISOString(),
                },
              },
            },
          };
        }),

      // Test State
      currentTest: null,

      startTest: (questions: Question[], timeLimit: number) =>
        set({
          currentTest: {
            id: generateId(),
            startedAt: new Date().toISOString(),
            questions,
            answers: {},
            flagged: [],
            timeLimit,
          },
        }),

      answerQuestion: (questionId: number, answer: string) =>
        set((state) => {
          if (!state.currentTest) return state;
          return {
            currentTest: {
              ...state.currentTest,
              answers: {
                ...state.currentTest.answers,
                [questionId]: answer,
              },
            },
          };
        }),

      flagQuestion: (questionId: number) =>
        set((state) => {
          if (!state.currentTest) return state;
          const flagged = state.currentTest.flagged.includes(questionId)
            ? state.currentTest.flagged.filter((id) => id !== questionId)
            : [...state.currentTest.flagged, questionId];

          return {
            currentTest: {
              ...state.currentTest,
              flagged,
            },
          };
        }),

      submitTest: () =>
        set((state) => {
          if (!state.currentTest) return state;

          const completedTest: TestSession = {
            ...state.currentTest,
            completedAt: new Date().toISOString(),
          };

          return {
            currentTest: null,
            progress: {
              ...state.progress,
              testSessions: [...state.progress.testSessions, completedTest],
            },
          };
        }),

      // Bookmarks
      toggleBookmark: (questionId: number) =>
        set((state) => {
          const bookmarks = state.progress.bookmarkedQuestions;
          const updated = bookmarks.includes(questionId)
            ? bookmarks.filter((id) => id !== questionId)
            : [...bookmarks, questionId];

          return {
            progress: {
              ...state.progress,
              bookmarkedQuestions: updated,
            },
          };
        }),
    }),
    {
      name: 'claude-cert-exam-prep-store',
      partialize: (state) => ({
        theme: state.theme,
        progress: state.progress,
      }),
    }
  )
);

// Hydration hook — prevents redirects before localStorage is loaded
export const useHasHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    // If already hydrated (e.g. sync storage), set immediately
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
};

