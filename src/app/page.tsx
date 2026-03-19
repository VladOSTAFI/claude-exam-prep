import { getAllModules } from '@/lib/modules';
import ModuleCard from '@/components/modules/ModuleCard';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

const heroStats = [
  { value: '5', label: 'Domains' },
  { value: '60', label: 'Questions' },
  { value: '720', label: 'to Pass' },
];

export default async function HomePage() {
  let modules: Awaited<ReturnType<typeof getAllModules>> = [];
  try {
    modules = await getAllModules();
  } catch {
    // modules may not be available yet
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
          Claude Certified Architect
        </h1>
        <p className="text-xl sm:text-2xl text-[#7f56d9] font-semibold mb-8">
          Exam Prep
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10">
          {heroStats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-2 sm:gap-4">
              {i > 0 && (
                <span className="text-[var(--text-secondary)] text-2xl font-light">|</span>
              )}
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {stat.value}
                </span>
                <span className="ml-2 text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <Button href="/modules" size="lg">
            Start Learning
          </Button>
          <Button href="/tests" variant="secondary" size="lg">
            Take Practice Test
          </Button>
        </div>
      </section>

      {/* Modules grid */}
      {modules.length > 0 && (
        <section className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Study Modules</h2>
            <Button href="/modules" variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <ModuleCard key={mod.slug} module={mod} />
            ))}
          </div>
        </section>
      )}

      {modules.length === 0 && (
        <section className="text-center animate-slide-up">
          <GlassCard className="p-12 max-w-xl mx-auto">
            <p className="text-[var(--text-secondary)] mb-4">
              Study modules are being prepared. Check back soon or explore the practice tests.
            </p>
            <Button href="/tests">Try Practice Tests</Button>
          </GlassCard>
        </section>
      )}
    </div>
  );
}
