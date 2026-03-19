import { getAllModules } from '@/lib/modules';
import ModuleGrid from '@/components/modules/ModuleGrid';

export default async function ModulesPage() {
  let modules: Awaited<ReturnType<typeof getAllModules>> = [];
  try {
    modules = await getAllModules();
  } catch {
    // modules may not be available yet
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Study Modules
        </h1>
        <p className="text-[var(--text-secondary)]">
          Master all five domains of the Claude Certified Architect exam.
          Each module covers key task statements and concepts you need to know.
        </p>
      </div>

      {modules.length > 0 ? (
        <ModuleGrid modules={modules} />
      ) : (
        <div className="glass p-12 text-center rounded-lg">
          <p className="text-[var(--text-secondary)]">
            No modules available yet. Content is being prepared.
          </p>
        </div>
      )}
    </div>
  );
}
