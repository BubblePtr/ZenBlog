# 页脚重设计方案

**日期：** 2026-02-28
**状态：** 已批准
**设计目标：** 扩充页脚内容结构，提升专业感，同时保持项目极简风格

---

## 设计概述

将当前单行简单页脚升级为左重右轻的非对称三栏布局，增加站点导航和更清晰的信息架构，同时保持极简美学和现有的交互效果。

---

## 视觉布局

```
┌──────────────────────────────────────────────────────────┐
│  Silicon Universe                    导航        联系     │
│                                      博客        GitHub  │
│                                      摄影        Twitter │
│                                      项目        Email   │
│                                      关于        RSS     │
│                                                          │
│  © 2026 · All rights reserved                            │
│  ● All Systems Normal                    [ ↑ 回到顶部 ]  │
└──────────────────────────────────────────────────────────┘
```

---

## 详细规格

### 1. 整体容器

- **布局：** 单区域，顶部用 `border-t` 分隔线与页面内容隔开
- **背景：** `bg-white dark:bg-black`
- **边框：** `border-t border-zinc-200 dark:border-zinc-800`
- **内边距：** `px-6 py-16`（比现有的 `py-12` 更大，给内容更多呼吸空间）
- **最大宽度：** `max-w-[84rem] mx-auto`（与 Header 保持一致）

### 2. 三栏布局（桌面端）

#### 左栏（品牌区）— 约 50% 宽度
- **品牌名：** "Silicon Universe"
  - 样式：`text-lg font-medium text-zinc-900 dark:text-zinc-100`
- **底部信息：** 版权声明和系统状态（与品牌名用 `mt-12` 间距分隔）

#### 中栏（导航区）— 约 25% 宽度
- **小标题：** "导航" / "Navigate"
  - 样式：`text-xs uppercase tracking-wider text-zinc-400 mb-3`
- **链接列表：** 博客、摄影、项目、关于
  - 样式：`text-sm text-zinc-600 dark:text-zinc-400`
  - Hover：`text-zinc-900 dark:text-zinc-100`
  - 垂直排列，`space-y-2`

#### 右栏（社交区）— 约 25% 宽度
- **小标题：** "联系" / "Connect"
  - 样式：`text-xs uppercase tracking-wider text-zinc-400 mb-3`
- **社交图标：** GitHub、Twitter/X、Email、RSS
  - 保留现有的 Magnetic 磁吸效果
  - 图标尺寸：20px
  - 样式：`text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100`
  - 垂直排列，`space-y-2`

### 3. 底部信息行

- **左侧：** `© 2026 Silicon Universe · All rights reserved`
  - 样式：`text-xs text-zinc-400`
- **右侧：** 系统状态指示器 + 回到顶部按钮
  - 系统状态：绿色脉动圆点 + "系统运行正常" / "All Systems Normal"
  - 回到顶部按钮：保留 Magnetic 效果和平滑滚动
- **与上方内容间距：** `mt-12`

### 4. 响应式行为

- **桌面端（lg+）：** 三栏水平排列，比例约 5:2.5:2.5
- **平板端（md-lg）：** 左栏占满一行，导航和社交并排第二行
- **移动端（<md）：** 全部垂直堆叠，居中对齐

### 5. 保留的交互效果

- 社交图标的 Magnetic 磁吸效果（`strength={0.2}`）
- 回到顶部按钮的 Magnetic 效果和平滑滚动
- 所有链接的 hover 颜色过渡（`transition-colors`）

### 6. 国际化支持

- 小标题（"导航" / "Navigate"，"联系" / "Connect"）根据 `lang` 参数切换
- 导航链接根据当前语言生成对应路径（英文无前缀，中文 `/zh/` 前缀）
- 系统状态文字根据语言切换

---

## 技术实现要点

### 组件结构

```tsx
<footer>
  <div className="max-w-[84rem] mx-auto px-6 py-16">
    {/* 主体三栏区 */}
    <div className="grid grid-cols-1 md:grid-cols-10 gap-8 lg:gap-12">
      {/* 左栏：品牌区 */}
      <div className="md:col-span-5">
        <h2>Silicon Universe</h2>
      </div>

      {/* 中栏：导航区 */}
      <div className="md:col-span-2">
        <h3>导航 / Navigate</h3>
        <nav>...</nav>
      </div>

      {/* 右栏：社交区 */}
      <div className="md:col-span-3">
        <h3>联系 / Connect</h3>
        <div>社交图标...</div>
      </div>
    </div>

    {/* 底部信息行 */}
    <div className="mt-12 flex justify-between items-center">
      <div>版权信息 + 系统状态</div>
      <div>回到顶部按钮</div>
    </div>
  </div>
</footer>
```

### 导航链接数据

```typescript
const NAV_LINKS = [
  { href: '/blog', labelKey: 'nav.blog' },
  { href: '/photography', labelKey: 'nav.photography' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/about', labelKey: 'nav.about' },
];
```

### 社交链接数据（保留现有）

```typescript
const SOCIAL_LINKS = [
  { icon: RiGithubFill, href: 'https://github.com/BubblePtr', label: 'GitHub' },
  { icon: RiTwitterXFill, href: 'https://twitter.com/ninthbit_ai', label: 'Twitter' },
  { icon: RiMailLine, href: 'mailto:oldmeatovo@gmail.com', label: 'Email' },
  { icon: RiRssLine, href: '/rss.xml', label: 'RSS Feed' },
];
```

---

## 设计原则

1. **YAGNI（You Aren't Gonna Need It）：** 只添加必要的内容（站点导航、社交链接、版权信息），不添加多余功能
2. **保持极简风格：** 使用项目现有的颜色系统（zinc 灰度）和字体系统，不引入新的视觉元素
3. **信息层次清晰：** 通过三栏布局和小标题明确区分不同类型的信息
4. **保留现有交互：** Magnetic 磁吸效果、平滑滚动、系统状态指示器等特色功能全部保留
5. **响应式优先：** 确保在所有设备上都有良好的阅读体验

---

## 与现有设计的对比

| 维度 | 现有设计 | 新设计 |
|------|---------|--------|
| 布局 | 单行水平布局 | 三栏非对称布局 |
| 内容 | 版权 + 社交 + 状态 | 品牌 + 导航 + 社交 + 版权 + 状态 |
| 信息架构 | 扁平，无层次 | 分栏，层次清晰 |
| 视觉风格 | 极简 | 极简（保持一致） |
| 交互效果 | Magnetic + 平滑滚动 | Magnetic + 平滑滚动（保留） |
| 垂直空间 | `py-12` | `py-16`（稍大） |

---

## 下一步

1. 更新翻译字典，添加导航小标题和联系小标题的翻译键
2. 修改 `SiteFooter.client.tsx` 组件实现新布局
3. 测试响应式行为和暗色模式
4. 验证所有链接和交互效果正常工作
