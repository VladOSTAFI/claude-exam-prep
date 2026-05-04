import type { Metadata } from "next";
import { getLandingMarkdown, getAllModules } from "@/lib/modules";
import ModuleContent from "@/components/ModuleContent";
import ModuleCard from "@/components/ModuleCard";

export const metadata: Metadata = {
  title: "CCA-F Exam Prep — Claude Certified Architect Foundations",
};

export default function HomePage() {
  const markdown = getLandingMarkdown();
  const modules = getAllModules();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Landing markdown: exam overview */}
      <div className="mx-auto max-w-4xl">
        <ModuleContent markdown={markdown} />
      </div>

      {/* Module card grid */}
      <section aria-labelledby="modules-heading" className="mt-14">
        <h2
          id="modules-heading"
          className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100"
        >
          Study Modules
        </h2>
        <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
          The exam overview above is reference material only — it has no self-check quiz.
          Each of the seven modules below includes a quiz at the bottom of the page.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.slug}
              slug={mod.slug}
              title={mod.title}
              domain={mod.domain}
              weight={mod.weight}
              summary={mod.summary}
              estMinutes={mod.estMinutes}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
