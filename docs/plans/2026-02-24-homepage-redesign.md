# 首页重新设计 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将首页从 Bento 卡片网格风格重构为极简内容优先布局，包含 Hero、文章、摄影、项目四个区块。

**Architecture:** 保持 Astro + React 岛屿架构不变。在 Astro 页面层获取所有数据（博客、摄影、项目），传入重构后的 `HomeLanding` React 组件。新增摄影和项目的首页查询函数，新增两个 Section 组件，重写 Hero 和 Writing Section，删除 Bento 相关组件。

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, Framer Motion, bun

---

### Task 1: 添加国际化翻译键

**Files:**
- Modify: `src/i18n/translations/en.ts`
- Modify: `src/i18n/translations/zh.ts`

**Step 1: 在 en.ts 的 Home 区块末尾添加新翻译键**

在 `'home.writing': 'Selected Writing',` 之后添加：

```typescript
'home.hero.name': 'Latens',
'home.hero.tagline': 'Software Engineer & Indie Developer',
'home.photography': 'Photography',
'home.projects': 'Projects',
```

**Step 2: 在 zh.ts 的首页区块末尾添加对应翻译**

在 `'home.writing': '精选文章',` 之后添加：

```typescript
'home.hero.name': '静水深流',
'home.hero.tagline': '软件工程师 & 独立开发者',
'home.photography': '摄影',
'home.projects': '项目',
```

**Step 3: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 构建成功

**Step 4: 提交**

```bash
git add src/i18n/translations/en.ts src/i18n/translations/zh.ts
git commit -m "添加首页重设计所需的翻译键"
```

---

### Task 2: 添加摄影和项目的首页数据查询

**Files:**
- Modify: `src/features/photography/server/queries.server.ts`
- Modify: `src/features/projects/server/queries.server.ts`

**Step 1: 在 `queries.server.ts`（photography）末尾添加首页查询函数**

```typescript
export async function getPhotographyForHome(lang: Language, limit = 6): Promise<PhotographyPhotoItem[]> {
  const entries = (await getCollection('photography')).sort(comparePhotographyEntries);
  return entries.slice(0, limit).map((entry) => mapPhotographyPhotoItem(entry, lang));
}
```

**Step 2: 在 `queries.server.ts`（projects）末尾添加带 limit 的查询函数**

```typescript
export async function getProjectsForHome(limit = 4): Promise<ProjectListItem[]> {
  const allProjects = (await getCollection('projects')).sort(
    (a, b) => a.data.order - b.data.order,
  );
  return allProjects.slice(0, limit).map(mapProjectListItem);
}
```

**Step 3: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 构建成功

**Step 4: 提交**

```bash
git add src/features/photography/server/queries.server.ts src/features/projects/server/queries.server.ts
git commit -m "添加摄影和项目的首页数据查询函数"
```

---

### Task 3: 更新 HomeLanding 类型定义

**Files:**
- Modify: `src/features/home/types.ts`

**Step 1: 扩展 HomeLandingProps 以包含摄影和项目数据**

将文件内容替换为：

```typescript
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
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 可能有类型错误（HomeLanding 组件尚未更新），记录但继续

**Step 3: 提交**

```bash
git add src/features/home/types.ts
git commit -m "扩展首页组件类型定义"
```

---

### Task 4: 重写 Hero Section

**Files:**
- Rewrite: `src/features/home/sections/HomeHeroSection.client.tsx`

**Step 1: 重写 HomeHeroSection 为极简风格**

完整替换文件内容：

```tsx
import { motion } from 'framer-motion';
import { RiGithubFill, RiTwitterXFill, RiMailLine } from '@remixicon/react';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

interface HomeHeroSectionProps {
  t: TranslationDictionary;
}

export default function HomeHeroSection({ t }: HomeHeroSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;

  return (
    <section className="mb-24 sm:mb-32">
      <motion.h1
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        {translate('home.hero.name')}
      </motion.h1>
      <motion.p
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-3 text-base text-zinc-500 dark:text-zinc-400"
      >
        {translate('home.hero.tagline')}
      </motion.p>
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-4 flex items-center gap-4"
      >
        <a href="https://github.com/BubblePtr" target="_blank" rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <RiGithubFill size={18} />
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <RiTwitterXFill size={18} />
        </a>
        <a href="mailto:contact@kieranzhang.dev"
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <RiMailLine size={18} />
        </a>
      </motion.div>
    </section>
  );
}
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`

**Step 3: 提交**

```bash
git add src/features/home/sections/HomeHeroSection.client.tsx
git commit -m "重写 Hero Section 为极简风格"
```

---

### Task 5: 重写 Writing Section

**Files:**
- Rewrite: `src/features/home/sections/HomeWritingSection.client.tsx`

**Step 1: 重写为简洁的标题+日期列表**

完整替换文件内容：

```tsx
import { motion } from 'framer-motion';
import type { BlogListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomeWritingSectionProps {
  posts: BlogListItem[];
  lang: Language;
  t: TranslationDictionary;
}

export default function HomeWritingSection({ posts, lang, t }: HomeWritingSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const getBlogUrl = (slug: string) => (lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);
  const getBlogListUrl = () => (lang === 'zh' ? '/zh/blog' : '/blog');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {translate('home.writing')}
        </h2>
        <a
          href={getBlogListUrl()}
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {translate('home.viewAll')} →
        </a>
      </div>

      <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/50">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={getBlogUrl(post.slug)}
            className="group flex items-baseline justify-between py-3 no-underline transition-transform hover:translate-x-0.5"
          >
            <span className="text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors truncate mr-4">
              {post.data.title}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 font-mono tabular-nums">
              {new Date(post.data.pubDate).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                year: 'numeric',
                month: 'short',
              })}
            </span>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`

**Step 3: 提交**

```bash
git add src/features/home/sections/HomeWritingSection.client.tsx
git commit -m "重写 Writing Section 为简洁列表风格"
```

---

### Task 6: 创建 Photography Section

**Files:**
- Create: `src/features/home/sections/HomePhotographySection.client.tsx`

**Step 1: 创建摄影区组件**

```tsx
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
      <div className="flex items-baseline justify-between mb-8 max-w-2xl">
        <h2 className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {translate('home.photography')}
        </h2>
        <a
          href={getPhotographyUrl()}
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {translate('home.viewAll')} →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div key={photo.slug} className="group relative overflow-hidden rounded-md aspect-[4/3]">
            <img
              src={photo.data.imageSrc}
              alt={photo.data.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {photo.data.location && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <span className="text-white text-sm px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.data.location}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`

**Step 3: 提交**

```bash
git add src/features/home/sections/HomePhotographySection.client.tsx
git commit -m "创建首页摄影区组件"
```

---

### Task 7: 创建 Projects Section

**Files:**
- Create: `src/features/home/sections/HomeProjectsSection.client.tsx`

**Step 1: 创建项目区组件**

```tsx
import { motion } from 'framer-motion';
import { RiGithubFill, RiExternalLinkLine } from '@remixicon/react';
import type { ProjectListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomeProjectsSectionProps {
  projects: ProjectListItem[];
  lang: Language;
  t: TranslationDictionary;
}

export default function HomeProjectsSection({ projects, lang, t }: HomeProjectsSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;

  if (projects.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      <div className="flex items-baseline justify-between mb-8 max-w-2xl">
        <h2 className="text-sm text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {translate('home.projects')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="group border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              {project.data.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
              {project.data.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {project.data.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {project.data.github && (
                  <a href={project.data.github} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <RiGithubFill size={16} />
                  </a>
                )}
                {project.data.demo && (
                  <a href={project.data.demo} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <RiExternalLinkLine size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`

**Step 3: 提交**

```bash
git add src/features/home/sections/HomeProjectsSection.client.tsx
git commit -m "创建首页项目区组件"
```

---

### Task 8: 重写 HomeLanding 组件

**Files:**
- Rewrite: `src/features/home/components/HomeLanding.client.tsx`

**Step 1: 重写 HomeLanding，组装四个 Section**

完整替换文件内容：

```tsx
import type { HomeLandingProps } from '@/features/home/types';
import HomeHeroSection from '@/features/home/sections/HomeHeroSection.client';
import HomeWritingSection from '@/features/home/sections/HomeWritingSection.client';
import HomePhotographySection from '@/features/home/sections/HomePhotographySection.client';
import HomeProjectsSection from '@/features/home/sections/HomeProjectsSection.client';

export default function HomeLanding({ posts, photos, projects, lang, t }: HomeLandingProps) {
  return (
    <div className="mx-auto px-6 py-16 sm:py-24">
      {/* Hero 和 Writing 区：窄宽度 640px */}
      <div className="max-w-2xl mx-auto">
        <HomeHeroSection t={t} />
        <HomeWritingSection posts={posts} lang={lang} t={t} />
      </div>

      {/* Photography 和 Projects 区：宽宽度 960px */}
      <div className="max-w-4xl mx-auto">
        <HomePhotographySection photos={photos} lang={lang} t={t} />
        <HomeProjectsSection projects={projects} lang={lang} t={t} />
      </div>
    </div>
  );
}
```

**Step 2: 验证构建**

Run: `bun run build 2>&1 | tail -20`

**Step 3: 提交**

```bash
git add src/features/home/components/HomeLanding.client.tsx
git commit -m "重写 HomeLanding 组装新的四区块布局"
```

---

### Task 9: 更新 Astro 页面数据获取

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/zh/index.astro`（如果存在）

**Step 1: 更新 `src/pages/index.astro`**

完整替换文件内容：

```astro
---
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';
import { HomeLanding } from '@/features/home';
import { getBlogListByLang } from '@/features/blog/server';
import { getPhotographyForHome } from '@/features/photography/server/queries.server';
import { getProjectsForHome } from '@/features/projects/server/queries.server';
import PageShell from '@/shared/components/layout/PageShell.astro';
import { getTranslationDictionary } from '@/shared/i18n/types';

const lang = 'en' as const;
const t = getTranslationDictionary(lang);
const homePosts = await getBlogListByLang(lang, { homeOnly: true, limit: 5 });
const homePhotos = await getPhotographyForHome(lang, 6);
const homeProjects = await getProjectsForHome(4);
---

<PageShell lang={lang} title={SITE_TITLE} description={SITE_DESCRIPTION} currentPath="/">
  <HomeLanding client:load posts={homePosts} photos={homePhotos} projects={homeProjects} lang={lang} t={t} />
</PageShell>
```

**Step 2: 检查是否存在中文首页并同步更新**

Run: `ls src/pages/zh/index.astro 2>/dev/null && echo "EXISTS" || echo "NOT FOUND"`

如果存在，同样更新数据获取逻辑（lang 改为 `'zh'`）。

**Step 3: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 构建成功

**Step 4: 提交**

```bash
git add src/pages/index.astro src/pages/zh/index.astro
git commit -m "更新首页数据获取，传入摄影和项目数据"
```

---

### Task 10: 删除废弃组件

**Files:**
- Delete: `src/features/home/sections/HomeBentoSection.client.tsx`
- Delete: `src/features/home/components/BentoItem.client.tsx`
- Delete: `src/features/home/components/TechDeck.client.tsx`
- Delete: `src/features/home/components/TimeDisplay.client.tsx`

**Step 1: 确认无其他文件引用这些组件**

Run: `grep -r "BentoItem\|TechDeck\|TimeDisplay\|HomeBentoSection" src/ --include="*.tsx" --include="*.ts" --include="*.astro" -l`

Expected: 只有被删除的文件本身互相引用，不应出现 HomeLanding 等文件

**Step 2: 删除文件**

```bash
rm src/features/home/sections/HomeBentoSection.client.tsx
rm src/features/home/components/BentoItem.client.tsx
rm src/features/home/components/TechDeck.client.tsx
rm src/features/home/components/TimeDisplay.client.tsx
```

**Step 3: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 构建成功

**Step 4: 提交**

```bash
git add -A
git commit -m "删除废弃的 Bento 相关组件"
```

---

### Task 11: 清理不再使用的翻译键和 Cover 组件引用

**Files:**
- Modify: `src/i18n/translations/en.ts`（移除 `home.building.*`、`home.location`、`home.music` 键）
- Modify: `src/i18n/translations/zh.ts`（同上）

**Step 1: 确认 Cover 组件是否还有其他引用**

Run: `grep -r "from.*cover" src/ --include="*.tsx" --include="*.ts" -l`

如果只有 Hero Section 引用（已在 Task 4 中移除），则 Cover 组件可安全保留（不主动删除，可能其他地方会用到）。

**Step 2: 从 en.ts 移除废弃的翻译键**

移除以下键：
- `'home.building'`
- `'home.building.title'`
- `'home.building.desc'`
- `'home.location'`
- `'home.music'`
- `'home.hero.title1'`
- `'home.hero.title2'`
- `'home.hero.title3'`
- `'home.hero.subtitle'`

**Step 3: 从 zh.ts 移除同样的废弃键**

**Step 4: 验证构建**

Run: `bun run build 2>&1 | tail -20`
Expected: 构建成功

**Step 5: 提交**

```bash
git add src/i18n/translations/en.ts src/i18n/translations/zh.ts
git commit -m "清理废弃的翻译键"
```

---

### Task 12: 最终验证

**Step 1: 完整构建**

Run: `bun run build`
Expected: 构建成功，无错误

**Step 2: 启动预览服务器手动检查**

Run: `bun run preview`（用户手动在浏览器中检查）

验证清单：
- [ ] Hero 区显示名字 + 一句话描述 + 社交图标
- [ ] 文章区显示标题 + 日期列表，hover 有微妙位移
- [ ] 摄影区显示 2-3 列照片网格，hover 有放大和地点浮层
- [ ] 项目区显示 2 列卡片，hover 边框变化
- [ ] 暗色模式正常
- [ ] 移动端响应式正常
- [ ] 中文页面（/zh/）正常

**Step 3: 提交最终状态（如有修复）**

```bash
git add -A
git commit -m "首页重新设计完成"
```
