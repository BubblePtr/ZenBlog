import type { PhotographyDateGroup } from '@/features/photography/server';
import type { PhotoExif } from '@/types/content';
import type { TranslationDictionary } from '@/shared/i18n/types';

interface PhotographyGalleryProps {
  groups: PhotographyDateGroup[];
  t: TranslationDictionary;
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
          {allPhotos.map((photo, index) => {
            const brandLogo = getBrandLogo(photo.data.exif?.brand);
            const exifLine = buildExifLine(photo.data.exif, Boolean(brandLogo));
            const ratio =
              photo.data.imageWidth && photo.data.imageHeight
                ? `${photo.data.imageWidth} / ${photo.data.imageHeight}`
                : getFallbackAspectRatio(index);

            return (
              <article key={photo.slug} className="space-y-2">
                <div
                  className="w-full overflow-hidden border border-[#e5e5e5] dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                  style={{ aspectRatio: ratio }}
                >
                  <img
                    src={photo.data.imageSrc}
                    alt={photo.data.title}
                    loading="lazy"
                    className="block w-full h-full object-cover"
                  />
                </div>
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
