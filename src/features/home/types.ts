import type { BlogListItem, PhotographyPhotoItem, ProjectListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary } from '@/shared/i18n/types';

export interface HomeLandingProps {
  posts: BlogListItem[];
  photos: PhotographyPhotoItem[];
  projects: ProjectListItem[];
  lang: Language;
  t: TranslationDictionary;
}
