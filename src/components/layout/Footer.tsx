import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} CCA Exam Prep. Not affiliated with Anthropic.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/modules"
              className="text-sm text-[var(--text-secondary)] hover:text-[#7f56d9] transition-all duration-300"
            >
              Study Modules
            </Link>
            <Link
              href="/tests"
              className="text-sm text-[var(--text-secondary)] hover:text-[#7f56d9] transition-all duration-300"
            >
              Practice Tests
            </Link>
            <Link
              href="/progress"
              className="text-sm text-[var(--text-secondary)] hover:text-[#7f56d9] transition-all duration-300"
            >
              Progress
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
