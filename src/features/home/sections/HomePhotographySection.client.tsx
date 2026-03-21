import { motion } from 'framer-motion';
import type { PhotographyPhotoItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomePhotographySectionProps {
  photos: PhotographyPhotoItem[];
  lang: Language;
  t: TranslationDictionary;
}

export default function HomePhotographySection({ photos, lang, t }: HomePhotographySectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const getPhotographyUrl = () => (lang === 'zh' ? '/zh/photography' : '/photography');

  if (photos.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      <div className="mb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            {translate('home.photography')}
          </h2>
          <a
            href={getPhotographyUrl()}
            className="group inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <span>{translate('home.viewAll')}</span>
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">→</span>
          </a>
        </div>
        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.photography.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {photos.slice(0, 5).map((photo, index) => (
          <div
            key={photo.slug}
            className={[
              'group relative overflow-hidden',
              index === 0 ? 'col-span-2 aspect-[3/2] lg:aspect-[16/10]' : '',
              index === 1 ? 'aspect-[4/3] lg:aspect-auto' : '',
              index >= 2 ? 'aspect-[4/3]' : '',
            ].join(' ')}
          >
            <img
              src={photo.data.imageSrc}
              alt={photo.data.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
