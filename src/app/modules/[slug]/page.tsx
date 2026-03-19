import { notFound } from 'next/navigation';
import { getModuleBySlug, getModuleSlugs, getAllModules } from '@/lib/modules';
import { renderMarkdown } from '@/lib/markdown';
import Sidebar from '@/components/layout/Sidebar';
import ModuleContent from '@/components/modules/ModuleContent';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MarkCompleteButton from '@/components/modules/MarkCompleteButton';

const domainColors = ['#e07a5f', '#3d85c6', '#10b981', '#f59e0b', '#8b5cf6'];

export async function generateStaticParams() {
  try {
    const slugs = await getModuleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function ModuleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let mod;
  try {
    mod = await getModuleBySlug(params.slug);
  } catch {
    notFound();
  }

  if (!mod) notFound();

  const html = await renderMarkdown(mod.content);
  const color = domainColors[(mod.domain - 1) % domainColors.length];

  // Get all modules for prev/next navigation
  let allModules: Awaited<ReturnType<typeof getAllModules>> = [];
  try {
    allModules = await getAllModules();
  } catch {
    // ignore
  }

  const currentIndex = allModules.findIndex((m) => m.slug === mod!.slug);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="domain" color={color}>
            Domain {mod.domain}
          </Badge>
          <span className="text-sm text-[var(--text-secondary)]">
            {mod.weight}% of exam
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          {mod.title}
        </h1>
        <p className="text-[var(--text-secondary)]">{mod.description}</p>
      </div>

      {/* Content + Sidebar */}
      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <ModuleContent html={html} />

          {/* Mark complete */}
          <div className="mt-10 mb-8">
            <MarkCompleteButton slug={mod.slug} />
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-4 pt-8 border-t border-[var(--border-card)]">
            {prevModule ? (
              <Button href={`/modules/${prevModule.slug}`} variant="secondary" size="sm">
                &larr; {prevModule.title}
              </Button>
            ) : (
              <div />
            )}
            {nextModule ? (
              <Button href={`/modules/${nextModule.slug}`} variant="secondary" size="sm">
                {nextModule.title} &rarr;
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>

        <Sidebar sections={mod.sections} />
      </div>
    </div>
  );
}
