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
      <div className="mb-10 max-w-3xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {translate('home.photography')}
          </h2>
          <a
            href={getPhotographyUrl()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <span>{translate('home.viewAll')}</span>
            <span>→</span>
          </a>
        </div>
        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.photography.description')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-12">
        {photos.slice(0, 5).map((photo, index) => (
          <div
            key={photo.slug}
            className={[
              'relative overflow-hidden',
              index === 0
                ? 'col-span-2 aspect-[4/3] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:min-h-[32rem]'
                : '',
              index === 1 ? 'aspect-[4/5] lg:col-span-5 lg:min-h-[15.5rem]' : '',
              index === 2 ? 'aspect-[4/3] lg:col-span-5 lg:min-h-[15.5rem]' : '',
              index === 3 ? 'aspect-[4/3] lg:col-span-4 lg:min-h-[14rem]' : '',
              index === 4 ? 'aspect-[4/3] lg:col-span-8 lg:min-h-[14rem]' : '',
            ].join(' ')}
          >
            <img
              src={photo.data.imageSrc}
              alt={photo.data.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
              <p className="text-sm tracking-tight">{photo.data.title}</p>
              {photo.data.location ? (
                <p className="mt-1 text-xs text-white/72">{photo.data.location}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
