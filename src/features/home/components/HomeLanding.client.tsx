import type { HomeLandingProps } from '@/features/home/types';
import BubbleDiarySpotlight from '@/features/blog/components/BubbleDiarySpotlight.client';
import HomeHeroSection from '@/features/home/sections/HomeHeroSection.client';
import HomeWritingSection from '@/features/home/sections/HomeWritingSection.client';
import HomePhotographySection from '@/features/home/sections/HomePhotographySection.client';
import HomeProjectsSection from '@/features/home/sections/HomeProjectsSection.client';

export default function HomeLanding({ posts, bubbleDiary, photos, projects, lang, t }: HomeLandingProps) {
  return (
    <div className="max-w-[84rem] mx-auto px-6 py-16 sm:py-24">
      <HomeHeroSection t={t} />
      <BubbleDiarySpotlight bubbleDiary={bubbleDiary} lang={lang} t={t} variant="home" />
      <HomeProjectsSection projects={projects} lang={lang} t={t} />
      <HomeWritingSection posts={posts} lang={lang} t={t} />
      <HomePhotographySection photos={photos} lang={lang} t={t} />
    </div>
  );
}
