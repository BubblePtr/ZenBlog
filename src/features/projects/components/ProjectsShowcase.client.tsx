import { RiExternalLinkLine, RiFolderLine, RiGitBranchLine } from '@remixicon/react';
import type { ProjectListItem } from '@/types/content';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface ProjectsShowcaseProps {
  projects: ProjectListItem[];
  t: TranslationDictionary;
}

export default function ProjectsShowcase({ projects, t }: ProjectsShowcaseProps) {
  const translate = (key: TranslationKey) => t[key] || key;

  if (projects.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
        <p className="text-zinc-400 font-mono text-sm">{translate('projects.empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <article
          key={project.slug}
          className="group border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <div className="h-44 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            {project.data.heroImage ? (
              <img
                src={project.data.heroImage}
                alt={project.data.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                <RiFolderLine size={42} />
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-heading text-xl text-zinc-900 dark:text-zinc-100">
                {project.data.title}
              </h3>
              <div className="flex items-center gap-2">
                {project.data.github && (
                  <a
                    href={project.data.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="GitHub"
                  >
                    <RiGitBranchLine size={16} />
                  </a>
                )}
                {project.data.demo && (
                  <a
                    href={project.data.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    aria-label="Live Demo"
                  >
                    <RiExternalLinkLine size={16} />
                  </a>
                )}
              </div>
            </div>

            <p className="mt-3 text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
              {project.data.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.data.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
