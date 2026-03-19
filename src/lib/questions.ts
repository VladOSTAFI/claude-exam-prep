import fs from 'fs';
import path from 'path';
import type { Question } from '@/types';

const practiceTestPath = path.join(process.cwd(), 'modules', 'practice-tests.md');

// Domain name to domain number mapping
const domainNumberMap: Record<string, number> = {
  'Agentic Architecture & Orchestration': 1,
  'Tool Design & MCP Integration': 2,
  'Claude Code Configuration & Workflows': 3,
  'Prompt Engineering & Structured Output': 4,
  'Context Management & Reliability': 5,
};

function parseQuestions(content: string): Question[] {
  const questions: Question[] = [];

  // Split on ### Question N headers.
  // We use a regex that captures the question number and everything until the next ### Question or end.
  const questionPattern = /### Question (\d+)\s*\n([\s\S]*?)(?=\n### Question \d+\s*\n|## Domain \d|## Question Difficulty|## Study Strategy|$)/g;

  let match;
  while ((match = questionPattern.exec(content)) !== null) {
    const id = parseInt(match[1], 10);
    const block = match[2].trim();

    // Extract domain and difficulty from the first line
    const metaMatch = block.match(
      /\*\*Domain:\*\*\s*(.+?)\s*\|\s*\*\*Difficulty:\*\*\s*(Easy|Medium|Hard)/
    );
    if (!metaMatch) continue;

    const domain = metaMatch[1].trim();
    const difficulty = metaMatch[2].trim() as 'Easy' | 'Medium' | 'Hard';
    const domainNumber = domainNumberMap[domain] || 0;

    // Find the scenario: everything between the metadata line and the first option "- A)"
    // We need to be careful with code blocks that may contain "- A)" like patterns
    const metaLineEnd = block.indexOf('\n', block.indexOf(metaMatch[0])) + 1;
    const afterMeta = block.slice(metaLineEnd);

    // Find "- A)" that starts an option list. We look for it at the start of a line,
    // outside of code blocks.
    const optionAIndex = findOptionAOutsideCodeBlocks(afterMeta);
    if (optionAIndex === -1) continue;

    const scenario = afterMeta.slice(0, optionAIndex).trim();

    // Extract options: find all "- X)" patterns
    const optionsAndRest = afterMeta.slice(optionAIndex);

    // Find the <details> block which marks the end of options
    const detailsIndex = optionsAndRest.indexOf('<details>');
    const optionsBlock =
      detailsIndex !== -1
        ? optionsAndRest.slice(0, detailsIndex).trim()
        : optionsAndRest.trim();

    // Parse individual options
    const options: { label: string; text: string }[] = [];
    const optionRegex = /^- ([A-D])\)\s*(.+)$/gm;
    let optMatch;
    while ((optMatch = optionRegex.exec(optionsBlock)) !== null) {
      options.push({
        label: optMatch[1],
        text: optMatch[2].trim(),
      });
    }

    if (options.length === 0) continue;

    // Extract correct answer and explanation from <details> block
    const detailsMatch = optionsAndRest.match(
      /<details>\s*<summary>Show Answer<\/summary>\s*([\s\S]*?)\s*<\/details>/
    );

    let correctAnswer = '';
    let explanation = '';

    if (detailsMatch) {
      const detailsContent = detailsMatch[1].trim();

      const answerMatch = detailsContent.match(
        /\*\*Correct Answer:\s*([A-D])\)/
      );
      correctAnswer = answerMatch ? answerMatch[1] : '';

      const explainMatch = detailsContent.match(
        /\*\*Explanation:\*\*\s*([\s\S]*)/
      );
      explanation = explainMatch ? explainMatch[1].trim() : '';
    }

    questions.push({
      id,
      domain,
      domainNumber,
      difficulty,
      scenario,
      options,
      correctAnswer,
      explanation,
    });
  }

  return questions;
}

/**
 * Find the index of "- A)" at the start of a line, skipping any occurrences
 * inside fenced code blocks (``` ... ```).
 */
function findOptionAOutsideCodeBlocks(text: string): number {
  const lines = text.split('\n');
  let inCodeBlock = false;
  let currentIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock && /^- A\)/.test(trimmed)) {
      // Return the index in the original text
      return currentIndex;
    }

    currentIndex += line.length + 1; // +1 for the newline
  }

  return -1;
}

let cachedQuestions: Question[] | null = null;

function loadQuestions(): Question[] {
  if (cachedQuestions) return cachedQuestions;
  const content = fs.readFileSync(practiceTestPath, 'utf-8');
  cachedQuestions = parseQuestions(content);
  return cachedQuestions;
}

export function getAllQuestions(): Question[] {
  return loadQuestions();
}

export function getQuestionsByDomain(domainNumber: number): Question[] {
  return loadQuestions().filter((q) => q.domainNumber === domainNumber);
}

export function getQuestionsByDifficulty(difficulty: string): Question[] {
  return loadQuestions().filter(
    (q) => q.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
}
