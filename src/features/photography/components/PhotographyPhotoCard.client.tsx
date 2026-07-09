import { useState } from 'react';
import type { PhotographyPhotoItem, PhotoExif } from '@/types/content';
import { Skeleton } from '@/components/ui/skeleton';
import ImageWithSkeleton from '@/shared/components/media/ImageWithSkeleton.client';

interface PhotographyPhotoCardProps {
  photo: PhotographyPhotoItem;
  index: number;
}

function buildExifLine(exif?: PhotoExif, omitBrand = false): string | undefined {
  const camera = [omitBrand ? undefined : exif?.brand, exif?.model].filter(Boolean).join(' ');
  const base = [camera, exif?.focalLength, exif?.aperture, exif?.shutterSpeed].filter(Boolean);

  if (exif?.iso) {
    base.push(`ISO ${exif.iso}`);
  }

  if (base.length === 0) return undefined;
  return base.join(' · ');
}

function getFallbackAspectRatio(index: number): string {
  const presets = ['4 / 5', '3 / 2', '1 / 1', '2 / 3', '5 / 4'];
  return presets[index % presets.length];
}

function getBrandLogo(brand?: string): { src: string; alt: string } | undefined {
  if (!brand) return undefined;

  const normalizedBrand = brand.trim().toLowerCase();
  const brandLogos = [
    { keyword: 'nikon', src: '/logos/camera/nikon.svg', alt: 'Nikon' },
    { keyword: 'canon', src: '/logos/camera/canon.svg', alt: 'Canon' },
    { keyword: 'fujifilm', src: '/logos/camera/fujifilm.svg', alt: 'Fujifilm' },
    { keyword: 'leica', src: '/logos/camera/leica.svg', alt: 'Leica' },
    { keyword: 'sony', src: '/logos/camera/sony.svg', alt: 'Sony' },
  ] as const;

  const matched = brandLogos.find((item) => normalizedBrand.includes(item.keyword));
  if (matched) return { src: matched.src, alt: matched.alt };

  return undefined;
}

/**
 * Photography grid card with shadcn Card-style skeleton while the image loads:
 * media block + two text bars (title / meta), matching ui.shadcn.com Skeleton Card.
 */
export default function PhotographyPhotoCard({ photo, index }: PhotographyPhotoCardProps) {
  const [imageReady, setImageReady] = useState(false);
  const brandLogo = getBrandLogo(photo.data.exif?.brand);
  const exifLine = buildExifLine(photo.data.exif, Boolean(brandLogo));
  const ratio =
    photo.data.imageWidth && photo.data.imageHeight
      ? `${photo.data.imageWidth} / ${photo.data.imageHeight}`
      : getFallbackAspectRatio(index);

  return (
    <article className="space-y-2">
      <ImageWithSkeleton
        src={photo.data.imageSrc}
        srcSet={photo.data.imageSrcSet}
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        width={photo.data.imageWidth}
        height={photo.data.imageHeight}
        alt={photo.data.title}
        loading="lazy"
        decoding="async"
        frameClassName="w-full border border-[#e5e5e5] dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
        frameStyle={{ aspectRatio: ratio }}
        className="object-cover"
        onStatusChange={(status) => setImageReady(status !== 'loading')}
      />

      {!imageReady ? (
        // shadcn Skeleton Card text rows (CardHeader equivalent)
        <div className="space-y-2 pt-1" aria-hidden="true">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ) : (
        <>
          {photo.data.location && (
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              {photo.data.location}
            </p>
          )}
          <h3 className="font-heading text-[15px] font-semibold leading-[1.4] text-[#0c0a09] dark:text-zinc-100">
            {photo.data.title}
          </h3>
          {exifLine && (
            <div className="flex min-h-4 items-center gap-2">
              {brandLogo && (
                <span className="flex h-4 items-center shrink-0">
                  <img
                    src={brandLogo.src}
                    alt={`${brandLogo.alt} logo`}
                    loading="lazy"
                    className="block h-4 w-auto max-w-14"
                  />
                </span>
              )}
              <p className="m-0 font-mono text-xs uppercase tracking-[0.02em] leading-none text-[#78716c] dark:text-zinc-400">
                {exifLine}
              </p>
            </div>
          )}
        </>
      )}
    </article>
  );
}
