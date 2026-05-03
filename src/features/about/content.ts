import type { Language } from '@/i18n/config';

export type TimelineEntryType = 'role' | 'education' | 'making' | 'life';

export interface TimelineLink {
  label: string;
  href: string;
}

export interface TimelineEntry {
  id: string;
  year: number;
  type: TimelineEntryType;
  summary: string;
  body?: string;
  links?: TimelineLink[];
}

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  note: string;
  href?: string;
}

export interface WorkingGroup {
  id: string;
  label: string;
  description: string;
}

export interface AboutContent {
  timeline: TimelineEntry[];
  reading: ReadingItem[];
  working: WorkingGroup[];
}

const en: AboutContent = {
  timeline: [
    {
      id: 'enrolled-finance',
      year: 2017,
      type: 'education',
      summary: 'Enrolled in a finance program.',
      body: "Finance was the family expectation — a 'stable' career. By the second year I was writing Excel macros to backtest paper-trading ideas, getting my first real taste of code's leverage.",
    },
    {
      id: 'thesis-python',
      year: 2019,
      type: 'life',
      summary: 'First non-trivial Python — a thesis saved by code.',
      body: 'My senior thesis needed text analysis on thousands of corporate annual reports. Three sleepless nights with BeautifulSoup, then a week to ship. After that I knew: code is not a tool, it is a stance for solving problems.',
    },
    {
      id: 'self-taught-cpp',
      year: 2020,
      type: 'education',
      summary: 'Self-taught C/C++, from primer to STL source.',
      body: 'Turned down a research-analyst offer and locked myself in a dorm with C++ Primer and the SGI STL source. Three months of barely getting things to compile, then a fourth month where template metaprogramming finally clicked. Two habits stayed: read disassembly on Godbolt, read source before docs.',
    },
    {
      id: 'huawei-cangjie',
      year: 2021,
      type: 'role',
      summary: 'Joined Huawei: Cangjie compiler internals.',
      body: "First job, deep end. Worked on the front-end of Cangjie — Huawei's in-house language — covering the parser, type checker, and error recovery. Read more LLVM source in those months than I had written code in my life. The discipline of 'understand the system before changing it' came from here.",
    },
    {
      id: 'lsp-services',
      year: 2022,
      type: 'making',
      summary: 'Brought LSP into VS Code and LeetCode editors.',
      body: "Wrote the LSP integration that powered Cangjie's tooling inside VS Code, and a stripped-down version that ran in LeetCode's browser editor. A lot of TypeScript reading. Performance budgets in a browser context taught me to think about latency before correctness.",
    },
    {
      id: 'harmonyos-ai-helpdesk',
      year: 2023,
      type: 'making',
      summary: 'AI diagnostic assistant for HarmonyOS app teams.',
      body: 'Before HarmonyOS Next launched, I built a diagnostic assistant — knowledge graph plus LLM — that triaged adaptation issues raised by app teams like Feishu and Douyin. Watching senior engineers use it changed how I think about AI: it does not replace experts, it amplifies them.',
    },
    {
      id: 'leave-huawei',
      year: 2024,
      type: 'life',
      summary: 'Left Huawei to work independently.',
      body: 'No heroic reason — I had seen what I came to see, and the rest of my time felt like it should belong to me. Saved enough to live frugally for a couple of years, and walked out.',
    },
    {
      id: 'autoglm',
      year: 2024,
      type: 'making',
      summary: 'Hacked on AutoGLM until the agent could really move.',
      body: "Forked Zhipu's AutoGLM and wired it into macOS system APIs so it could drive a real browser, Cursor, Linear. Two months of work that mostly taught me where current agents actually break: not at the model, at the tool layer.",
    },
    {
      id: 'maiui-test-runner',
      year: 2025,
      type: 'making',
      summary: "GUI agent test runner on Alibaba's MAIUI.",
      body: 'Traditional E2E testing relies on hand-written selectors. Inside an agent-driven UI, that contract is broken. I built a layer on MAIUI that lets an agent observe the screen and propose its own test cases. Still iterating, but it now runs against my own products.',
    },
    {
      id: 'bubble',
      year: 2025,
      type: 'making',
      summary: 'Started Bubble, an agent that keeps its own diary.',
      body: "Bubble is not just a task agent — it writes its own field notes, maintains a worldview, and carries continuity across sessions. I think of it as a long-term experiment in 'AI as companion, not utility.' Its diary lives on this site.",
      links: [{ label: "Bubble's diary", href: '/blog/' }],
    },
    {
      id: 'this-site',
      year: 2026,
      type: 'making',
      summary: 'This site as an ongoing public archive.',
      body: 'Engineering notes, AI experiments, photographs, and reading notes — all kept in one place. Not chasing reach, just trying to leave something a future me will recognise as honest work.',
    },
  ],
  reading: [
    {
      id: 'foucault-archaeology',
      title: 'The Archaeology of Knowledge',
      author: 'Michel Foucault',
      note: "On how 'archive' and 'discourse' actually get formed.",
    },
    {
      id: 'eghbal-working-in-public',
      title: 'Working in Public',
      author: 'Nadia Eghbal',
      note: 'The unromantic mechanics of how open source actually runs.',
    },
    {
      id: 'wang-yangming-chuanxilu',
      title: '《传习录》',
      author: '王阳明',
      note: "Re-reading 'knowing and doing as one' through an engineer's lens.",
    },
    {
      id: 'christensen-innovators-dilemma',
      title: "The Innovator's Dilemma",
      author: 'Clayton Christensen',
      note: 'Why incumbents lose on the very strengths that built them.',
    },
  ],
  working: [
    {
      id: 'editor',
      label: 'Editor',
      description: 'Zed for daily work, Neovim on remote machines.',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      description: 'Ghostty + zsh + fzf, occasionally Wezterm for tmux-heavy days.',
    },
    {
      id: 'notes',
      label: 'Notes',
      description: 'Obsidian for permanent notes, this site for the public ones.',
    },
    {
      id: 'hardware',
      label: 'Hardware',
      description: 'MacBook Pro M4 16-inch, Sony α7C II for photographs.',
    },
  ],
};

const zh: AboutContent = {
  timeline: [
    {
      id: 'enrolled-finance',
      year: 2017,
      type: 'education',
      summary: '进入财经院校，开始学金融。',
      body: '选金融是家里的期望——一份"稳定"的职业。大二开始用 Excel 宏跑策略回测，第一次体会到代码的杠杆。',
    },
    {
      id: 'thesis-python',
      year: 2019,
      type: 'life',
      summary: '第一段像样的 Python：被代码救活的毕业论文。',
      body: '毕业论文要给几千份上市公司年报做文本分析。三天通宵学完 BeautifulSoup，又用一周写完。从那以后我知道：编程不是工具，是一种解决问题的姿态。',
    },
    {
      id: 'self-taught-cpp',
      year: 2020,
      type: 'education',
      summary: '自学 C/C++，从 Primer 一路读到 SGI STL。',
      body: '拒了一份券商研究的 offer，把自己关在宿舍读《C++ Primer》和 SGI STL 源码。前三个月几乎写不出像样的程序，第四个月开始能做模板元编程。两个习惯留了下来：用 Godbolt 看汇编、遇事先读源码。',
    },
    {
      id: 'huawei-cangjie',
      year: 2021,
      type: 'role',
      summary: '加入华为，做仓颉编译器。',
      body: '第一份工作就接触底层。做仓颉（华为自研语言）的编译器前端：parser、类型检查、错误恢复。那几个月读的 LLVM 源码比之前写过的代码总量还多。"先读懂再动手"的工作习惯从这里开始。',
    },
    {
      id: 'lsp-services',
      year: 2022,
      type: 'making',
      summary: '把 LSP 接到 VS Code 与力扣编辑器。',
      body: '做了仓颉在 VS Code 里的 LSP 集成，以及一个能在力扣浏览器编辑器里跑的精简版。读了很多 TypeScript 源码。浏览器里的性能预算让我习惯先想延迟、再想正确性。',
    },
    {
      id: 'harmonyos-ai-helpdesk',
      year: 2023,
      type: 'making',
      summary: '为飞书、抖音的鸿蒙团队做 AI 诊断助手。',
      body: '鸿蒙 Next 上线前，我做了一个诊断助手：知识图谱 + LLM，给一线 App（飞书、抖音等）的鸿蒙适配问题做分诊。看着资深工程师真在用这个工具，让我对 AI 有了新的理解：它不是替代专家，而是放大他们。',
    },
    {
      id: 'leave-huawei',
      year: 2024,
      type: 'life',
      summary: '离开华为，开始独立开发。',
      body: '没有什么英雄主义的理由。该看的看到了，剩下的时间应该还给自己。攒够了节俭过几年的生活费，然后就走了。',
    },
    {
      id: 'autoglm',
      year: 2024,
      type: 'making',
      summary: '改造 AutoGLM，让 Agent 真的动起来。',
      body: '智谱开源 AutoGLM 后，我做了一个 fork，把它接到 macOS 系统级 API，让它能控制浏览器、Cursor、Linear。两个月的工作让我看清当前 Agent 的瓶颈不在模型，而在工具层。',
    },
    {
      id: 'maiui-test-runner',
      year: 2025,
      type: 'making',
      summary: '在阿里 MAIUI 上做 GUI Agent 自动化测试。',
      body: '传统 E2E 测试需要手写选择器。Agent 驱动的界面里，这个契约已经坏了。我在 MAIUI 上做了一层：让 Agent 看着界面提议测试用例。还在迭代，已经在我自己的几个产品上跑通了。',
    },
    {
      id: 'bubble',
      year: 2025,
      type: 'making',
      summary: '启动 Bubble：一个会写日记的 Agent。',
      body: 'Bubble 不只是任务型 Agent——它会写自己的日记、维护自己的世界观、跨会话保留连续性。我把它当作一个长期实验："AI 是伙伴，不是工具"。它的日记就放在这个站里。',
      links: [{ label: 'Bubble 的日记', href: '/zh/blog/' }],
    },
    {
      id: 'this-site',
      year: 2026,
      type: 'making',
      summary: '这个空间在做的事。',
      body: '工程笔记、AI 实验、摄影、读书都放在这里。不追求曝光，只想留下几年后回来还觉得对得起那时自己的东西。',
    },
  ],
  reading: [
    {
      id: 'foucault-archaeology',
      title: '《知识考古学》',
      author: '米歇尔·福柯',
      note: '"档案"和"话语"到底是怎么形成的。',
    },
    {
      id: 'eghbal-working-in-public',
      title: 'Working in Public',
      author: 'Nadia Eghbal',
      note: '开源社区不浪漫的运行机制。',
    },
    {
      id: 'wang-yangming-chuanxilu',
      title: '《传习录》',
      author: '王阳明',
      note: '在工程师的视角下重读"知行合一"。',
    },
    {
      id: 'christensen-innovators-dilemma',
      title: '《创新者的窘境》',
      author: '克莱顿·克里斯坦森',
      note: '为什么大公司总在自己的优势上输掉。',
    },
  ],
  working: [
    {
      id: 'editor',
      label: '编辑器',
      description: '日常用 Zed，远程机器上用 Neovim。',
    },
    {
      id: 'terminal',
      label: '终端',
      description: 'Ghostty + zsh + fzf，重度 tmux 时切到 Wezterm。',
    },
    {
      id: 'notes',
      label: '笔记',
      description: '永久笔记在 Obsidian，公开的部分放这里。',
    },
    {
      id: 'hardware',
      label: '设备',
      description: 'MacBook Pro M4 16-inch，相机用 Sony α7C II。',
    },
  ],
};

const content: Record<Language, AboutContent> = { en, zh };

export function getAboutContent(lang: Language): AboutContent {
  return content[lang];
}
