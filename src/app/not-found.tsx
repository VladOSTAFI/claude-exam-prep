import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-slate-200 dark:text-slate-700">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        The page you requested does not exist. The exam overview is only available at the home page.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Back to home
      </Link>
    </div>
  );
}
