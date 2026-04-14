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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      {/* 区块标题：标题+View All 全宽，描述限宽 */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between">
          <h2
            className={`text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl ${lang === 'zh' ? 'font-article-title' : 'font-serif-en'}`}
          >
            {translate('home.photography')}
          </h2>
          <a
            href={getPhotographyUrl()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 no-underline dark:text-zinc-400"
          >
            <span>{translate('home.viewAll')}</span>
            <span>→</span>
          </a>
        </div>
        <p className="mt-4 max-w-3xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.photography.description')}
        </p>
      </div>

      {/* 内容区：rail 分割线 + 横排预览条 */}
      <div className="-mx-6 rail-line-t px-6 pt-8 sm:pt-10">
        <div className="grid grid-cols-3 gap-2">
          {photos.slice(0, 6).map((photo) => (
            <a
              key={photo.slug}
              href={getPhotographyUrl()}
              className="group relative block overflow-hidden"
            >
              <img
                src={photo.data.imageSrc}
                alt={photo.data.title}
                loading="lazy"
                className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-xs leading-snug tracking-tight text-white/90">
                  {photo.data.title}
                </p>
                {photo.data.location && (
                  <p className="mt-0.5 text-[11px] text-white/60">{photo.data.location}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
