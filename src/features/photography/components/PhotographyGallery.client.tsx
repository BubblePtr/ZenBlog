import type { PhotographyDateGroup } from '@/features/photography/server';
import type { TranslationDictionary } from '@/shared/i18n/types';
import PhotographyPhotoCard from '@/features/photography/components/PhotographyPhotoCard.client';

interface PhotographyGalleryProps {
  groups: PhotographyDateGroup[];
  t: TranslationDictionary;
}

export default function PhotographyGallery({ groups, t }: PhotographyGalleryProps) {
  const allPhotos = groups.flatMap((group) => group.photos);

  if (allPhotos.length === 0) {
    return (
      <p className="py-20 text-center font-mono text-sm text-zinc-400">{t['photography.empty']}</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
      {allPhotos.map((photo, index) => (
        <PhotographyPhotoCard key={photo.slug} photo={photo} index={index} />
      ))}
    </div>
  );
}
