import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllModules, getModuleBySlug } from "@/lib/modules";
import { extractToc } from "@/lib/markdown";
import { quizzesBySlug } from "@/content/quizzes";
import ModuleContent from "@/components/ModuleContent";
import ModuleNav from "@/components/ModuleNav";
import Toc from "@/components/Toc";
import Quiz from "@/components/Quiz";

interface PageProps {
  params: { slug: string };
}

/**
 * Only statically render the 7 non-landing module slugs.
 * Any other path (including /modules/exam-overview) falls through to notFound().
 * Setting dynamicParams = false ensures unlisted slugs return 404 at runtime.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = getModuleBySlug(params.slug);
  // Return empty metadata for landing module — it shouldn't be reached
  if (!result || result.meta.isLanding) return {};
  return {
    title: result.meta.title,
    description: result.meta.summary,
  };
}

export default function ModulePage({ params }: PageProps) {
  const result = getModuleBySlug(params.slug);

  // 404 if slug not found OR if it's the landing module (exam-overview)
  if (!result || result.meta.isLanding) {
    notFound();
  }

  const { meta, markdown } = result;
  const tocItems = extractToc(markdown);

  // Build prev/next navigation from the ordered non-landing modules list
  const modules = getAllModules();
  const currentIndex = modules.findIndex((m) => m.slug === params.slug);
  const prev = currentIndex > 0 ? modules[currentIndex - 1] : undefined;
  const next =
    currentIndex < modules.length - 1 ? modules[currentIndex + 1] : undefined;

  // Look up quiz — may be undefined if somehow slug has no quiz file
  const quiz = quizzesBySlug[params.slug];
  if (!quiz) {
    console.warn(`[ModulePage] No quiz found for slug: ${params.slug}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
        {/* Sidebar TOC — rendered as sticky on lg, collapsible details on smaller screens */}
        <Toc items={tocItems} />

        {/* Main content column */}
        <div className="min-w-0">
          {/* Module metadata badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Domain {meta.domain}
            </span>
            {meta.weight !== "—" && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {meta.weight} of exam
              </span>
            )}
            {meta.estMinutes && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ~{meta.estMinutes} min read
              </span>
            )}
          </div>

          {/* Rendered markdown prose */}
          <ModuleContent markdown={markdown} />

          {/* Prev / Next navigation */}
          <ModuleNav
            prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
            next={next ? { slug: next.slug, title: next.title } : undefined}
          />

          {/* Visual divider before quiz */}
          <hr className="my-10 border-slate-200 dark:border-slate-700" />

          {/* Quiz section — T8: wired from quizzesBySlug registry */}
          {quiz ? (
            <Quiz quiz={quiz} />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No quiz available for this module.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
