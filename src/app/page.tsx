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
    <>
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden border-b border-grey-200 bg-white dark:border-grey-800 dark:bg-grey-950"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-hero-fade"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply dark:opacity-20 dark:mix-blend-screen bg-grain-noise"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 grid-bg [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)] dark:opacity-30"
          style={{ height: "100%" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-800 shadow-xs backdrop-blur dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-200">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
              </span>
              Independent study companion
            </span>

            <h1
              id="hero-heading"
              className="mt-6 font-display text-4xl font-semibold tracking-tight text-grey-950 text-balance sm:text-5xl lg:text-6xl dark:text-grey-25"
            >
              Become a{" "}
              <span className="text-shimmer">Claude Certified Architect</span>
              <span className="block text-grey-500 dark:text-grey-400">— Foundations.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-grey-600 text-pretty sm:text-lg dark:text-grey-400">
              Seven focused modules. One-hundred-forty self-check questions.
              All the patterns, traps, and numbers you need to walk into the
              CCA-F exam confident.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#modules"
                className="group inline-flex items-center gap-2 rounded-xl bg-grey-950 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-grey-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 dark:bg-white dark:text-grey-950 dark:hover:bg-grey-100"
              >
                Start studying
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
              <a
                href="#overview"
                className="inline-flex items-center gap-2 rounded-xl border border-grey-200 bg-white px-5 py-2.5 text-sm font-semibold text-grey-800 shadow-xs transition-all hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-800 dark:border-grey-800 dark:bg-grey-900 dark:text-grey-200 dark:hover:border-primary-700 dark:hover:bg-primary-950/30 dark:hover:text-primary-200"
              >
                Read the overview
              </a>
            </div>

            <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 text-left sm:gap-6">
              {[
                { label: "Modules", value: "7" },
                { label: "Questions", value: "140" },
                { label: "Pass mark", value: "72%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-grey-200 bg-white/70 p-4 shadow-xs backdrop-blur dark:border-grey-800 dark:bg-grey-900/60"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-grey-500 dark:text-grey-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-semibold tracking-tight text-grey-950 dark:text-grey-25 sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <section id="modules" aria-labelledby="modules-heading" className="scroll-mt-24">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
                <span aria-hidden="true" className="h-1 w-4 rounded-full bg-primary-500" />
                Curriculum
              </p>
              <h2
                id="modules-heading"
                className="mt-1 font-display text-3xl font-semibold tracking-tight text-grey-950 dark:text-grey-25"
              >
                Seven study modules
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-grey-600 dark:text-grey-400">
              Each module ends with a 20-question self-check graded against the
              real exam&apos;s 720/1000 pass threshold.
            </p>
          </div>
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

        <section
          id="overview"
          aria-labelledby="overview-heading"
          className="mt-20 scroll-mt-24"
        >
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700 dark:text-primary-300">
              <span aria-hidden="true" className="h-1 w-4 rounded-full bg-primary-500" />
              Reference
            </p>
            <h2
              id="overview-heading"
              className="mt-1 font-display text-3xl font-semibold tracking-tight text-grey-950 dark:text-grey-25"
            >
              Exam overview
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-grey-600 dark:text-grey-400">
              The overview below is reference material — it has no self-check
              quiz. Use it to orient before diving into the modules.
            </p>
          </div>

          <div className="rounded-2xl border border-grey-200 bg-white p-6 shadow-xs sm:p-10 dark:border-grey-800 dark:bg-grey-900/60">
            <div className="mx-auto max-w-3xl">
              <ModuleContent markdown={markdown} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
