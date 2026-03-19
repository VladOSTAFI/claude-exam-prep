import fs from 'fs';
import path from 'path';
import type { Module, Section } from '@/types';
import { slugify } from './utils';

const modulesDirectory = path.join(process.cwd(), 'modules');

function parseModule(filename: string): Module {
  const filePath = path.join(modulesDirectory, filename);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract slug from filename: module-1-agentic-architecture.md -> module-1-agentic-architecture
  const slug = filename.replace(/\.md$/, '');

  // Extract domain number from filename: module-N-...
  const domainMatch = filename.match(/^module-(\d+)-/);
  const domain = domainMatch ? parseInt(domainMatch[1], 10) : 0;

  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract weight - handle multiple formats:
  // "Exam Weight: 27% | 7 Task Statements"
  // "**Weight:** 20% of exam | 6 Task Statements"
  // "**Exam Weight:** 20% | **Task Statements:** 6"
  // "**Exam Weight: 15% of total exam**"
  const weightMatch = content.match(/(?:Exam\s+)?Weight[:\s*]+(\d+)%/i);
  const weight = weightMatch ? parseInt(weightMatch[1], 10) : 0;

  // Extract task statements count - handle multiple formats:
  // "7 Task Statements"
  // "**Task Statements:** 6"
  // Fallback: count ## Task N.N headings in the content
  const taskMatch = content.match(
    /(\d+)\s+Task\s+Statements|Task\s+Statements[:\s*]+(\d+)/i
  );
  let taskStatements = taskMatch
    ? parseInt(taskMatch[1] || taskMatch[2], 10)
    : 0;

  if (taskStatements === 0) {
    const taskHeadings = content.match(/^## Task \d+\.\d+/gm);
    taskStatements = taskHeadings ? taskHeadings.length : 0;
  }

  // Extract description: first non-empty paragraph after the title line
  // Skip the title line, the metadata line, and any --- separators
  const lines = content.split('\n');
  let description = '';
  let pastTitle = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!pastTitle) {
      if (trimmed.startsWith('# ')) {
        pastTitle = true;
      }
      continue;
    }
    // Skip metadata lines, separators, empty lines
    if (
      trimmed === '' ||
      trimmed === '---' ||
      trimmed.startsWith('**Exam Weight') ||
      trimmed.startsWith('**Weight') ||
      trimmed.startsWith('**Estimated')
    ) {
      continue;
    }
    // Skip ## headings - we want the paragraph, not a heading
    if (trimmed.startsWith('#')) {
      // If we reach a heading without finding a paragraph, look in the ## Overview section
      break;
    }
    // Found the first paragraph
    description = trimmed;
    break;
  }

  // If no description found above (e.g., module-2 where first paragraph is under ## Overview),
  // look for the first paragraph after ## Overview
  if (!description) {
    let inOverview = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '## Overview' || trimmed === '## Module Overview') {
        inOverview = true;
        continue;
      }
      if (inOverview) {
        if (trimmed === '' || trimmed === '---') continue;
        if (trimmed.startsWith('#')) break;
        description = trimmed;
        break;
      }
    }
  }

  // Remove any bold markdown from description
  description = description.replace(/\*\*/g, '');

  // Extract sections: all ## and ### headings
  const sections: Section[] = [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length; // 2 or 3
    const sectionTitle = match[2].trim();
    sections.push({
      id: slugify(sectionTitle),
      title: sectionTitle,
      depth,
    });
  }

  return {
    slug,
    title,
    domain,
    weight,
    taskStatements,
    description,
    content,
    sections,
  };
}

let cachedModules: Module[] | null = null;

export function getAllModules(): Module[] {
  if (cachedModules) return cachedModules;

  const filenames = fs
    .readdirSync(modulesDirectory)
    .filter((f) => f.startsWith('module-') && f.endsWith('.md'));

  const modules = filenames.map(parseModule);
  modules.sort((a, b) => a.domain - b.domain);

  cachedModules = modules;
  return modules;
}

export function getModuleBySlug(slug: string): Module | undefined {
  return getAllModules().find((m) => m.slug === slug);
}

export function getModuleSlugs(): string[] {
  return getAllModules().map((m) => m.slug);
}
