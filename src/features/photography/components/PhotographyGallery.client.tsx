import type { PhotographyDateGroup } from '@/features/photography/server';
import type { TranslationDictionary } from '@/shared/i18n/types';
import PhotographyPhotoCard from '@/features/photography/components/PhotographyPhotoCard.client';

interface PhotographyGalleryProps {
  groups: PhotographyDateGroup[];
  t: TranslationDictionary;
}

export default function PhotographyGallery({ groups, t }: PhotographyGalleryProps) {
  const allPhotos = groups.flatMap((group) => group.photos);
  const title = t['photography.title'];
  const description = t['photography.description'];

  return (
    <div className="w-full">
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="kicker mb-5">Index / Photography</p>
        <h1
          className={`text-4xl sm:text-5xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 ${/[一-鿿]/.test(title) ? 'font-article-title' : 'font-serif-en'}`}
        >
          {title}
        </h1>
        <p className="font-light text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {allPhotos.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 font-mono text-sm">{t['photography.empty']}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
          {allPhotos.map((photo, index) => (
            <PhotographyPhotoCard key={photo.slug} photo={photo} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
