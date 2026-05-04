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

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllModules().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = getModuleBySlug(params.slug);
  if (!result || result.meta.isLanding) return {};
  return {
    title: result.meta.title,
    description: result.meta.summary,
  };
}

export default function ModulePage({ params }: PageProps) {
  const result = getModuleBySlug(params.slug);

  if (!result || result.meta.isLanding) {
    notFound();
  }

  const { meta, markdown } = result;
  const tocItems = extractToc(markdown);

  const modules = getAllModules();
  const currentIndex = modules.findIndex((m) => m.slug === params.slug);
  const prev = currentIndex > 0 ? modules[currentIndex - 1] : undefined;
  const next =
    currentIndex < modules.length - 1 ? modules[currentIndex + 1] : undefined;

  const quiz = quizzesBySlug[params.slug];
  if (!quiz) {
    console.warn(`[ModulePage] No quiz found for slug: ${params.slug}`);
  }

  const stepNumber = String(currentIndex + 1).padStart(2, "0");
  const totalSteps = String(modules.length).padStart(2, "0");

  return (
    <>
      <section
        aria-labelledby="module-heading"
        className="relative overflow-hidden border-b border-grey-200 bg-white dark:border-grey-800 dark:bg-grey-950"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-hero-fade opacity-70"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-grey-500 dark:text-grey-400">
            <a href="/" className="text-grey-500 hover:text-primary-700 dark:hover:text-primary-300">
              Modules
            </a>
            <span aria-hidden="true">/</span>
            <span className="text-grey-700 dark:text-grey-300">
              Domain {meta.domain}
            </span>
            <span aria-hidden="true">/</span>
            <span className="text-primary-700 dark:text-primary-300">
              {stepNumber} of {totalSteps}
            </span>
          </div>

          <h1
            id="module-heading"
            className="mt-4 max-w-4xl font-display text-3xl font-semibold tracking-tight text-grey-950 text-balance sm:text-4xl lg:text-5xl dark:text-grey-25"
          >
            {meta.title}
          </h1>

          {meta.summary && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-grey-600 sm:text-base dark:text-grey-400">
              {meta.summary}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-200 bg-grey-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-grey-700 dark:border-grey-700 dark:bg-grey-900 dark:text-grey-300">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              Domain {meta.domain}
            </span>
            {meta.weight !== "—" && (
              <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300">
                {meta.weight} of exam
              </span>
            )}
            {meta.estMinutes && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-200 bg-white px-3 py-1 text-[11px] font-medium text-grey-600 dark:border-grey-700 dark:bg-grey-900 dark:text-grey-400">
                <svg
                  aria-hidden="true"
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M6 3.5V6l1.75 1" />
                </svg>
                ~{meta.estMinutes} min read
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          <Toc items={tocItems} />

          <div className="min-w-0">
            <article className="rounded-2xl border border-grey-200 bg-white p-6 shadow-xs sm:p-10 dark:border-grey-800 dark:bg-grey-900/50">
              <ModuleContent markdown={markdown} />
            </article>

            <ModuleNav
              prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
              next={next ? { slug: next.slug, title: next.title } : undefined}
            />

            {quiz ? (
              <Quiz quiz={quiz} />
            ) : (
              <p className="mt-12 rounded-xl border border-dashed border-grey-300 bg-grey-50 p-6 text-sm text-grey-500 dark:border-grey-700 dark:bg-grey-900/40 dark:text-grey-400">
                No quiz available for this module.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
