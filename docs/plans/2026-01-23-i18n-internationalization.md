# 博客 i18n 国际化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 为博客添加中英文双语支持，博客文章内容保持原语言，其他页面（首页、关于页、项目页等）支持中英文切换，默认语言为英文。

**架构：** 使用 Astro 的 i18n 路由功能，创建语言切换组件，将 UI 文本提取到翻译文件中。采用 URL 路径方式区分语言（`/` 为英文，`/zh/` 为中文）。

**技术栈：** Astro i18n、TypeScript、React

---

## Task 1: 配置 Astro i18n 基础设施

**文件：**
- 修改: `astro.config.mjs`
- 创建: `src/i18n/config.ts`
- 创建: `src/i18n/utils.ts`

**Step 1: 更新 Astro 配置以启用 i18n**

修改 `astro.config.mjs`，添加 i18n 配置：

```javascript
export default defineConfig({
  site: 'https://kieranzhang.dev',
  output: 'static',
  adapter: cloudflare(),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    mdx(),
    sitemap(),
    react()
  ],
  // ... 其他配置保持不变
});
```

**Step 2: 创建 i18n 配置文件**

创建 `src/i18n/config.ts`：

```typescript
export const languages = {
  en: 'English',
  zh: '中文',
};

export const defaultLang = 'en';

export type Language = keyof typeof languages;
```

**Step 3: 创建 i18n 工具函数**

创建 `src/i18n/utils.ts`：

```typescript
import { defaultLang, type Language } from './config';

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang === 'zh') return 'zh';
  return defaultLang;
}

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    return translations[lang][key] || key;
  };
}
```

**Step 4: 提交配置更改**

```bash
git add astro.config.mjs src/i18n/
git commit -m "feat(i18n): 添加 Astro i18n 基础配置"
```

---

## Task 2: 创建翻译文件

**文件：**
- 创建: `src/i18n/translations/zh.ts`
- 创建: `src/i18n/translations/en.ts`
- 创建: `src/i18n/translations/index.ts`

**Step 1: 创建中文翻译文件**

创建 `src/i18n/translations/zh.ts`：

```typescript
export const zh = {
  // 导航
  'nav.blog': '博客',
  'nav.projects': '项目',
  'nav.about': '关于',
  
  // 首页
  'home.title': 'Silicon Universe',
  'home.description': '欢迎来到我的数字花园！',
  'home.latest': '最新文章',
  'home.viewAll': '查看全部',
  'home.readMore': '阅读更多',
  
  // 关于页
  'about.title': '关于我',
  'about.career': '职业经历',
  'about.gear': '装备与工具',
  'about.location': '上海，中国',
  
  // 项目页
  'projects.title': '项目',
  'projects.description': '我的一些项目和作品',
  
  // 页脚
  'footer.rights': '版权所有',
  
  // 通用
  'common.loading': '加载中...',
  'common.error': '出错了',
};
```

**Step 2: 创建英文翻译文件**

创建 `src/i18n/translations/en.ts`：

```typescript
export const en = {
  // Navigation
  'nav.blog': 'BLOG',
  'nav.projects': 'PROJECTS',
  'nav.about': 'ABOUT ME',
  
  // Home
  'home.title': 'Silicon Universe',
  'home.description': 'Welcome to my digital garden!',
  'home.latest': 'Latest Posts',
  'home.viewAll': 'View All',
  'home.readMore': 'Read More',
  
  // About
  'about.title': 'About Me',
  'about.career': 'Career Path',
  'about.gear': 'Gear & Tools',
  'about.location': 'Shanghai, China',
  
  // Projects
  'projects.title': 'Projects',
  'projects.description': 'Some of my projects and works',
  
  // Footer
  'footer.rights': 'All rights reserved',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
};
```

**Step 3: 创建翻译索引文件**

创建 `src/i18n/translations/index.ts`：

```typescript
import { zh } from './zh';
import { en } from './en';

export const translations = {
  zh,
  en,
};
```

**Step 4: 更新 utils.ts 导入翻译**

修改 `src/i18n/utils.ts`，添加导入：

```typescript
import { defaultLang, type Language } from './config';
import { translations } from './translations';

// ... 其他代码保持不变
```

**Step 5: 提交翻译文件**

```bash
git add src/i18n/translations/
git commit -m "feat(i18n): 添加中英文翻译文件"
```

---

## Task 3: 创建语言切换组件

**文件：**
- 创建: `src/components/react/LanguageSwitcher.tsx`

**Step 1: 创建语言切换组件**

创建 `src/components/react/LanguageSwitcher.tsx`：

```typescript
import { Languages } from 'lucide-react';
import { languages, type Language } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLang: Language;
  currentPath: string;
}

export default function LanguageSwitcher({ currentLang, currentPath }: LanguageSwitcherProps) {
  const getLocalizedPath = (lang: Language) => {
    // 移除当前语言前缀
    let path = currentPath;
    if (path.startsWith('/zh/')) {
      path = path.replace('/zh/', '/');
    } else if (path.startsWith('/zh')) {
      path = path.replace('/zh', '/');
    }

    // 添加新语言前缀（英文不需要前缀）
    if (lang === 'zh') {
      return `/zh${path === '/' ? '' : path}`;
    }
    return path;
  };

  return (
    <div className="relative group">
      <button
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        aria-label="Switch Language"
      >
        <Languages size={18} />
      </button>
      
      <div className="absolute right-0 top-full mt-2 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[120px]">
        {Object.entries(languages).map(([lang, label]) => (
          <a
            key={lang}
            href={getLocalizedPath(lang as Language)}
            className={`block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors no-underline ${
              currentLang === lang
                ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 提交语言切换组件**

```bash
git add src/components/react/LanguageSwitcher.tsx
git commit -m "feat(i18n): 添加语言切换组件"
```

---

## Task 4: 更新 Header 组件集成语言切换

**文件：**
- 修改: `src/components/react/FusionHeader.tsx`

**Step 1: 修改 FusionHeader 添加语言切换器**

修改 `src/components/react/FusionHeader.tsx`：

```typescript
import { Rss } from 'lucide-react';
import Magnetic from './Magnetic';
import LanguageSwitcher from './LanguageSwitcher';
import type { Language } from '@/i18n/config';

interface FusionHeaderProps {
  currentPath?: string;
  lang?: Language;
  translations?: Record<string, string>;
}

export default function FusionHeader({
  currentPath = '',
  lang = 'en',
  translations = {}
}: FusionHeaderProps) {
  const t = (key: string) => translations[key] || key;
  
  const isActive = (item: string) => {
    const path = currentPath.toLowerCase();
    const itemPath = `/${item.toLowerCase()}`;
    return path === itemPath || path.startsWith(`${itemPath}/`);
  };

  const navItems = [
    { key: 'blog', label: t('nav.blog') },
    { key: 'projects', label: t('nav.projects') },
    { key: 'about', label: t('nav.about') },
  ];

  return (
    <header className="relative z-40 w-full border-b border-zinc-900/80 dark:border-zinc-50/20 transition-all duration-300">
      <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-white/60"></div>
      <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")' }}></div>

      <div className="relative max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href={lang === 'zh' ? '/zh' : '/'} className="font-serif font-bold text-xl tracking-tight flex items-center gap-2 no-underline text-zinc-900 dark:text-zinc-100 leading-none">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse translate-y-[-2px]"></span>
          Silicon Universe
        </a>

        <nav className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {navItems.map(item => {
              const active = isActive(item.key);
              const href = lang === 'zh' ? `/zh/${item.key}` : `/${item.key}`;
              return (
                <Magnetic key={item.key} strength={0.2}>
                  <a
                    href={href}
                    className={`block px-2 py-2 transition-colors relative group no-underline ${
                      active ? 'text-zinc-900 dark:text-zinc-100' : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-1 left-2 h-px bg-zinc-900 dark:bg-zinc-100 transition-all ${
                        active ? 'w-[calc(100%-16px)]' : 'w-0 group-hover:w-[calc(100%-16px)] opacity-50'
                      }`}
                    />
                  </a>
                </Magnetic>
              );
            })}
          </div>

          <div className="flex items-center gap-3 border-l border-zinc-200 dark:border-zinc-800 pl-6">
            <Magnetic>
              <LanguageSwitcher currentLang={lang} currentPath={currentPath} />
            </Magnetic>
            <Magnetic>
              <a
                href="/rss.xml"
                target="_blank"
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-orange-500 transition-colors"
                aria-label="RSS Feed"
              >
                <Rss size={18} />
              </a>
            </Magnetic>
          </div>
        </nav>
      </div>
    </header>
  );
}
```

**Step 2: 提交 Header 更新**

```bash
git add src/components/react/FusionHeader.tsx
git commit -m "feat(i18n): 在 Header 中集成语言切换器"
```

---

## Task 5: 更新首页支持 i18n

**文件：**
- 修改: `src/pages/index.astro`
- 创建: `src/pages/zh/index.astro`

**Step 1: 更新英文首页（默认）**

修改 `src/pages/index.astro`，添加翻译支持：

```astro
---
import BaseHead from "../components/BaseHead.astro";
import SiliconBackground from "../components/react/SiliconBackground";
import FusionHeader from "../components/react/FusionHeader";
import FusionHome from "../components/react/FusionHome";
import FusionFooter from "../components/react/FusionFooter";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { BlogListItem } from "../types/content";
import { translations } from "@/i18n/translations";

const lang = 'en';
const t = translations[lang];

const allPosts = (await getCollection("blog")).sort(
  (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);

const posts: BlogListItem[] = allPosts.map((post: CollectionEntry<"blog">) => ({
  slug: post.id.replace(/\.[^/.]+$/, ""),
  data: {
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    showOnHome: post.data.showOnHome === true,
  },
}));

const homePosts = posts.filter((p) => p.data.showOnHome === true).slice(0, 5);
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
    <script is:inline>
      const theme = (() => {
        if (
          typeof localStorage !== "undefined" &&
          localStorage.getItem("theme")
        ) {
          return localStorage.getItem("theme");
        }
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return "dark";
        }
        return "light";
      })();
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    </script>
  </head>
  <body class="bg-white dark:bg-black transition-colors duration-500">
    <SiliconBackground client:load />
    <FusionHeader client:load currentPath="/" lang={lang} translations={t} />

    <main class="relative z-10">
      <FusionHome client:load posts={homePosts} translations={t} />
    </main>

    <FusionFooter client:visible translations={t} />
  </body>
</html>
```

**Step 2: 创建中文首页**

创建 `src/pages/zh/index.astro`：

```astro
---
import BaseHead from "../../components/BaseHead.astro";
import SiliconBackground from "../../components/react/SiliconBackground";
import FusionHeader from "../../components/react/FusionHeader";
import FusionHome from "../../components/react/FusionHome";
import FusionFooter from "../../components/react/FusionFooter";
import { SITE_TITLE, SITE_DESCRIPTION } from "../../consts";
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { BlogListItem } from "../../types/content";
import { translations } from "@/i18n/translations";

const lang = 'zh';
const t = translations[lang];

const allPosts = (await getCollection("blog")).sort(
  (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);

const posts: BlogListItem[] = allPosts.map((post: CollectionEntry<"blog">) => ({
  slug: post.id.replace(/\.[^/.]+$/, ""),
  data: {
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    showOnHome: post.data.showOnHome === true,
  },
}));

const homePosts = posts.filter((p) => p.data.showOnHome === true).slice(0, 5);
---

<!doctype html>
<html lang="zh">
  <head>
    <BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
    <script is:inline>
      const theme = (() => {
        if (
          typeof localStorage !== "undefined" &&
          localStorage.getItem("theme")
        ) {
          return localStorage.getItem("theme");
        }
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          return "dark";
        }
        return "light";
      }
      return "light";
      })();
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    </script>
  </head>
  <body class="bg-white dark:bg-black transition-colors duration-500">
    <SiliconBackground client:load />
    <FusionHeader client:load currentPath="/zh" lang={lang} translations={t} />

    <main class="relative z-10">
      <FusionHome client:load posts={homePosts} translations={t} />
    </main>

    <FusionFooter client:visible translations={t} />
  </body>
</html>
```

**Step 3: 提交首页更新**

```bash
git add src/pages/index.astro src/pages/zh/
git commit -m "feat(i18n): 更新首页支持中英文双语"
```

---

## Task 6: 更新 About 页面支持 i18n

**文件：**
- 修改: `src/pages/about.astro`
- 创建: `src/pages/zh/about.astro`
- 更新: `src/i18n/translations/zh.ts`
- 更新: `src/i18n/translations/en.ts`

**Step 1: 添加 About 页面翻译**

修改 `src/i18n/translations/zh.ts`，添加：

```typescript
// ... 现有翻译
'about.intro.title': '关于我',
'about.intro.p1': '你好！我是 Alex，一名来自上海的软件工程师。我喜欢创造生活在互联网上的东西。我对 Web 开发的兴趣始于 2015 年，当时我决定尝试编辑自定义 Tumblr 主题——事实证明，修改 HTML 和 CSS 教会了我很多关于 Web 工作原理的知识。',
'about.intro.p2': '快进到今天，我有幸在广告公司、初创公司和大型企业工作过。如今，我的主要重点是在 Upstatement 构建可访问、包容的产品和数字体验。',
'about.gear.editor': '编辑器',
'about.gear.terminal': '终端',
'about.gear.hardware': '硬件',
```

修改 `src/i18n/translations/en.ts`，添加：

```typescript
// ... existing translations
'about.intro.title': 'About Me',
'about.intro.p1': 'Hello! I\'m Alex, a software engineer based in Shanghai. I enjoy creating things that live on the internet. My interest in web development started back in 2015 when I decided to try editing custom Tumblr themes — turns out hacking together HTML & CSS taught me a lot about how the web works.',
'about.intro.p2': 'Fast-forward to today, and I\'ve had the privilege of working at an advertising agency, a start-up, and a huge corporation. My main focus these days is building accessible, inclusive products and digital experiences at Upstatement.',
'about.gear.editor': 'Editor',
'about.gear.terminal': 'Terminal',
'about.gear.hardware': 'Hardware',
```

**Step 2: 更新英文 About 页面（默认）**

修改 `src/pages/about.astro`，添加翻译支持（在 frontmatter 中添加）：

```astro
---
// ... 现有导入
import { translations } from "@/i18n/translations";

const lang = 'en';
const t = translations[lang];
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead
      title={`${t['nav.about']} | ${SITE_TITLE}`}
      description="More about me and my journey."
    />
    <!-- ... 主题脚本 -->
  </head>
  <body class="bg-white dark:bg-black transition-colors duration-500">
    <SiliconBackground client:load />
    <FusionHeader client:load currentPath="/about" lang={lang} translations={t} />
    <main class="max-w-5xl mx-auto px-6 py-12 sm:py-20 relative z-10">
      <!-- ... 保持现有布局，替换文本为 t['key'] -->
      <section>
        <h2 class="font-serif text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          {t['about.intro.title']}
        </h2>
        <div class="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>{t['about.intro.p1']}</p>
          <p>{t['about.intro.p2']}</p>
        </div>
      </section>
      <!-- ... 其他部分类似处理 -->
    </main>
    <FusionFooter client:visible translations={t} />
  </body>
</html>
```

**Step 3: 创建中文 About 页面**

创建 `src/pages/zh/about.astro`（复制英文版本，修改 lang 为 'zh'，currentPath 为 '/zh/about'）

**Step 4: 提交 About 页面更新**

```bash
git add src/pages/about.astro src/pages/zh/about.astro src/i18n/translations/
git commit -m "feat(i18n): 更新 About 页面支持中英文双语"
```

---

## Task 7: 更新 Projects 页面支持 i18n

**文件：**
- 修改: `src/pages/projects.astro`
- 创建: `src/pages/zh/projects.astro`

**Step 1: 更新英文 Projects 页面（默认）**

修改 `src/pages/projects.astro`，添加翻译支持（类似 About 页面的处理方式）

**Step 2: 创建中文 Projects 页面**

创建 `src/pages/zh/projects.astro`

**Step 3: 提交 Projects 页面更新**

```bash
git add src/pages/projects.astro src/pages/zh/projects.astro
git commit -m "feat(i18n): 更新 Projects 页面支持中英文双语"
```

---

## Task 8: 更新 Blog 列表页面（保持文章原语言）

**文件：**
- 修改: `src/pages/blog/index.astro`
- 创建: `src/pages/zh/blog/index.astro`

**Step 1: 更新英文 Blog 列表页（默认）**

修改 `src/pages/blog/index.astro`，仅翻译 UI 文本，文章标题和描述保持原样

**Step 2: 创建中文 Blog 列表页**

创建 `src/pages/zh/blog/index.astro`

**Step 3: 提交 Blog 列表页更新**

```bash
git add src/pages/blog/index.astro src/pages/zh/blog/
git commit -m "feat(i18n): 更新 Blog 列表页支持中英文 UI"
```

---

## Task 9: 更新 Footer 和其他共享组件

**文件：**
- 修改: `src/components/react/FusionFooter.tsx`
- 修改: `src/components/react/FusionHome.tsx`

**Step 1: 更新 FusionFooter 组件**

修改 `src/components/react/FusionFooter.tsx`，添加 translations prop

**Step 2: 更新 FusionHome 组件**

修改 `src/components/react/FusionHome.tsx`，添加 translations prop

**Step 3: 提交组件更新**

```bash
git add src/components/react/FusionFooter.tsx src/components/react/FusionHome.tsx
git commit -m "feat(i18n): 更新共享组件支持翻译"
```

---

## Task 10: 测试和优化

**Step 1: 本地测试英文页面（默认）**

运行开发服务器并测试：

```bash
npm run dev
```

访问 `http://localhost:4321/` 验证英文页面

**Step 2: 测试中文页面**

访问 `http://localhost:4321/zh/` 验证中文页面

**Step 3: 测试语言切换**

在各个页面测试语言切换功能是否正常

**Step 4: 测试博客文章链接**

确保博客文章链接在两种语言下都能正常访问

**Step 5: 构建生产版本**

```bash
npm run build
```

检查构建输出，确保没有错误

**Step 6: 提交最终优化**

```bash
git add .
git commit -m "feat(i18n): 完成 i18n 功能测试和优化"
```

---

## 注意事项

1. **博客文章路径保持不变**：博客文章 URL 不需要语言前缀，在两种语言下都使用 `/blog/[slug]` 访问
2. **默认语言为英文**：根路径 `/` 显示英文内容，中文内容在 `/zh/` 路径下
3. **SEO 优化**：需要在 `<head>` 中添加 `<link rel="alternate" hreflang="..." />` 标签
4. **RSS Feed**：可能需要为不同语言创建单独的 RSS feed
5. **sitemap**：确保 sitemap 包含所有语言版本的页面

