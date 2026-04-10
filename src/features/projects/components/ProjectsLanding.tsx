import type { Language } from '@/i18n/config';

interface ProjectsLandingProps {
  lang: Language;
}

interface ProductCard {
  brand: string;
  title: string;
  description: string;
  tags: string[];
}

const zhCopy = {
  headingLine1: '嗨! 朋友们, 我是蔡蔡',
  headingLine2: '产品设计师, YouMind 联合创始人、CPO',
  intro:
    '好久不见，欢迎来到我的个人网站。简单介绍下我自己，一个产品设计师，也是产品经理。曾在蚂蚁集团工作多年，一直在做效率、生产力工具。现在我以创始人的身份开启新的旅程，推出我们孵化的 AI 产品 - YouMind，欢迎关注。',
  sectionTitle: '产品',
  sectionSubtitle: '打造我们热爱的、真正需要的产品',
  tabs: ['人工智能', '应用', '网页服务', '开源项目', '超级应用', '全部'],
  cards: [
    {
      brand: 'ᐯᐱ YouMind',
      title: 'YouMind',
      description:
        'YouMind 通过存储视频、文章、播客、图片以及 PDF 等多种学习素材，帮助你管理与吸收内容。这些整理后的材料会成为你的创作资源，支持你将知识转化成灵感。',
      tags: ['人工智能', '创始人', '新品'],
    },
    {
      brand: '◘ Haye',
      title: 'Haye',
      description:
        'Haye 让你在 macOS 上轻松阅读与编辑文本，可以快速与 AI 对话、搜索信息，并一键转换文本，让任何语言的阅读与写作都更顺畅。',
      tags: ['人工智能', '创始人', '新品'],
    },
    {
      brand: '落影',
      title: '蚂蚁数字员工',
      description:
        '在 2023 到 2024 年间，我在蚂蚁集团打造了一位智能办公助理，用来提升效率并简化流程。通过把 AI 与办公网络结合，我们优化了差旅审批等协同任务。',
      tags: ['效率工具', '企业服务', 'AI Agent'],
    },
  ] satisfies ProductCard[],
};

const enCopy = {
  headingLine1: 'Hi friends, I am Caicai',
  headingLine2: 'Product Designer, Co-founder of YouMind, CPO',
  intro:
    'Welcome to my personal site. I am a product designer and product manager. I worked at Ant Group for years building productivity tools. Now I am on a new journey as a founder, building our AI product YouMind.',
  sectionTitle: 'Products',
  sectionSubtitle: 'Building products we truly love and need',
  tabs: ['AI', 'Apps', 'Web Service', 'Open Source', 'Super App', 'All'],
  cards: [
    {
      brand: 'ᐯᐱ YouMind',
      title: 'YouMind',
      description:
        'YouMind stores videos, articles, podcasts, images, and PDFs in one place. The organized knowledge becomes reusable creative assets for your writing and research workflow.',
      tags: ['AI', 'Founder', 'New'],
    },
    {
      brand: '◘ Haye',
      title: 'Haye',
      description:
        'Haye makes reading and editing text on macOS easier. You can chat with AI, search quickly, and convert text between formats and languages in one flow.',
      tags: ['AI', 'Founder', 'New'],
    },
    {
      brand: 'LuoYing',
      title: 'Ant Digital Employee',
      description:
        'From 2023 to 2024, I built an intelligent workplace assistant at Ant Group. By combining AI with enterprise workflows, we improved approval and collaboration efficiency.',
      tags: ['Productivity', 'Enterprise', 'AI Agent'],
    },
  ] satisfies ProductCard[],
};

export default function ProjectsLanding({ lang }: ProjectsLandingProps) {
  const copy = lang === 'zh' ? zhCopy : enCopy;

  return (
    <section className="rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="max-w-5xl">
        <h1 className="font-heading text-3xl sm:text-5xl leading-tight text-zinc-900 dark:text-zinc-100">
          <span className="block">{copy.headingLine1}</span>
          <span className="block mt-2">{copy.headingLine2}</span>
        </h1>
        <p className="mt-8 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {copy.intro}
        </p>
      </div>

      <div className="mt-20 sm:mt-28">
        <h2 className="font-heading text-xl text-zinc-900 dark:text-zinc-100">
          {copy.sectionTitle}
        </h2>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">{copy.sectionSubtitle}</p>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-2xl text-zinc-500 dark:text-zinc-400">
          {copy.tabs.map((tab) => (
            <span key={tab}>{tab}</span>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {copy.cards.map((card) => (
          <article key={card.title} className="min-w-0">
            <div className="h-64 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <div className="font-heading text-5xl text-zinc-900 dark:text-zinc-100">
                {card.brand}
              </div>
            </div>

            <h3 className="mt-5 font-heading text-2xl text-zinc-900 dark:text-zinc-100">
              {card.title}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {card.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
