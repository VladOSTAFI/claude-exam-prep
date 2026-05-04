import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-hero-fade"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(50%_50%_at_50%_50%,black,transparent)]"
      />
      <div className="relative mx-auto max-w-lg text-center">
        <p className="font-display text-[7rem] font-semibold leading-none tracking-tight text-shimmer sm:text-[9rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-grey-950 dark:text-grey-25">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-grey-600 dark:text-grey-400">
          The page you requested does not exist. The exam overview is only available
          on the home page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-grey-950 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-grey-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200 dark:bg-white dark:text-grey-950 dark:hover:bg-grey-100"
        >
          <span aria-hidden="true">←</span>
          Back home
        </Link>
      </div>
    </div>
  );
}
