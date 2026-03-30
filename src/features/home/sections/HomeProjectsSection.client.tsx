import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { RiGithubFill, RiExternalLinkLine } from '@remixicon/react';
import type { ProjectListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomeProjectsSectionProps {
  projects: ProjectListItem[];
  lang: Language;
  t: TranslationDictionary;
}

export default function HomeProjectsSection({ projects, t }: HomeProjectsSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? '');
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  if (projects.length === 0) return null;

  useEffect(() => {
    const items = itemRefs.current.filter(Boolean) as HTMLElement[];

    if (items.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        const slug = visibleEntry.target.getAttribute('data-project-slug');
        if (slug) {
          setActiveSlug(slug);
        }
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: [0.25, 0.45, 0.65],
      },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [projects]);

  return (
    <motion.section
      id="projects"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
      >
      <div className="mb-10 max-w-3xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {translate('home.projects')}
          </h2>
        </div>
        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.projects.description')}
        </p>
      </div>

      <div className="-mx-6 grid rail-line-x lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-0">
        <aside className="hidden lg:block">
          <div className="sticky top-24 px-6 py-6 pr-6">
            <div className="space-y-2">
              {projects.map((project) => {
                const isActive = project.slug === activeSlug;
                const projectMark = getProjectMark(project.data.title);

                return (
                  <a
                    key={project.slug}
                    href={`#project-${project.slug}`}
                    className={`group flex items-center gap-3 border-l pl-4 no-underline transition-all duration-300 ${
                      isActive
                        ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                        : 'border-zinc-200 text-zinc-400 hover:border-zinc-500 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
                        isActive
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                          : 'border-zinc-300 text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-500 dark:group-hover:border-zinc-500 dark:group-hover:text-zinc-300'
                      }`}
                    >
                      {projectMark}
                    </span>
                    <h3 className="text-sm tracking-tight">{project.data.title}</h3>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="lg:rail-line-y">
          {projects.map((project, index) => {
            const paragraphs = getProjectParagraphs(project.data.content);

            return (
              <article
                key={project.slug}
                id={`project-${project.slug}`}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                data-project-slug={project.slug}
                className={`grid min-h-[70svh] items-stretch lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,1.05fr)] ${
                  index > 0 ? 'rail-line-t' : ''
                }`}
              >
                <div className="px-6 py-8 lg:rail-line-r lg:px-10 lg:py-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 max-w-xl text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
                    {project.data.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
                    {project.data.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                    {project.data.stack.slice(0, 5).map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    {project.data.github && (
                      <a
                        href={project.data.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                        aria-label={`Open ${project.data.title} on GitHub`}
                      >
                        <RiGithubFill size={16} />
                      </a>
                    )}
                    {project.data.demo && (
                      <a
                        href={project.data.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                        aria-label={`Open ${project.data.title} demo`}
                      >
                        <RiExternalLinkLine size={16} />
                      </a>
                    )}
                  </div>

                  <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    {paragraphs.slice(1, 4).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {paragraphs.length <= 1 ? (
                      <p>{project.data.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="relative min-h-[24rem] overflow-hidden bg-zinc-100 dark:bg-zinc-900/70">
                  <div className="absolute inset-0">
                    {project.data.heroImage ? (
                      <img
                        src={project.data.heroImage}
                        alt={project.data.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_42%),linear-gradient(135deg,rgba(24,24,27,0.95),rgba(39,39,42,0.88))]" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="relative flex min-h-[24rem] flex-col justify-end p-6 sm:p-8">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
                      Project / {String(index + 1).padStart(2, '0')}
                    </p>
                    <h4 className="mt-3 text-2xl tracking-tight text-white">
                      {project.data.title}
                    </h4>
                    <p className="mt-2 max-w-lg text-sm leading-7 text-white/78">
                      {paragraphs[0] ?? project.data.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function getProjectParagraphs(content: string) {
  return content
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').trim())
    .filter(Boolean)
    .filter((paragraph) => !/^#+\s/.test(paragraph));
}

function getProjectMark(title: string) {
  return title
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}
