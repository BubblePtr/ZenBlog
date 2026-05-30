function getTextContent(node) {
  if (!node || typeof node !== 'object') {
    return '';
  }

  if (node.type === 'text') {
    return node.value ?? '';
  }

  if (!Array.isArray(node.children)) {
    return '';
  }

  return node.children.map(getTextContent).join('');
}

function hasAnchorHeadingLink(node) {
  return node.children?.some((child) => {
    const className = child.properties?.className;

    return (
      child.type === 'element' &&
      child.tagName === 'a' &&
      Array.isArray(className) &&
      className.includes('heading-anchor')
    );
  });
}

const translatedHeadings = new Map(
  Object.entries({
    基础交互状态管理: ['basic', 'interaction', 'state', 'management'],
    语义化提示框callouts: ['semantic', 'callouts'],
    嵌入式投票interactivepoll: ['embedded', 'voting', 'interactive', 'poll'],
    数据可视化chartdemo: ['data', 'visualization', 'chart', 'demo'],
    自由混排动画: ['free', 'form', 'animation', 'layout'],
    结论: ['conclusion'],
    确定选题: ['choose', 'your', 'topic'],
    生成调查报告: ['generate', 'research', 'report'],
    人工审视: ['manual', 'review'],
    输出内容: ['output', 'content'],
    如何使用youmind迭代一个想要的公众号改写prompt: [
      'use',
      'youmind',
      'iterate',
      'wechat',
      'rewriting',
      'prompt',
    ],
    收集顶流的爆款文章: ['collect', 'top', 'performing', 'articles'],
    融合自己的风格与定位: ['integrate', 'style', 'and', 'positioning'],
    生成prompt: ['generate', 'prompt'],
    生成配图建议: ['generate', 'image', 'suggestions'],
    添加配图: ['add', 'images'],
    文字排版工具校验: ['text', 'formatting', 'tool', 'review'],
    复制公众号格式: ['copy', 'wechat', 'format'],
    封面图生成: ['cover', 'image', 'generation'],
    帕萨迪纳的眼泪: ['tears', 'in', 'pasadena'],
    市场崩盘: ['market', 'crash'],
    失明: ['blindness'],
    普世智慧: ['worldly', 'wisdom'],
    写在最后: ['in', 'closing'],
    大数定律实验: ['law', 'of', 'large', 'numbers', 'experiment'],
    贝叶斯定理: ['bayes', 'theorem'],
    在量化交易里这个公式有什么用呢: ['use', 'in', 'quantitative', 'trading'],
    一个在polymarket市场中的实际例子: ['polymarket', 'example'],
    凯利公式: ['kelly', 'formula'],
    设定场景: ['scenario', 'setup'],
    第一步写出n次后的财富: ['step', '1', 'wealth', 'after', 'n', 'rounds'],
    第二步为什么不直接最大化期望值: ['step', '2', 'why', 'not', 'maximize', 'expected', 'value'],
    第三步换目标最大化长期增长率: ['step', '3', 'maximize', 'long', 'term', 'growth'],
    第四步对f求导: ['step', '4', 'differentiate', 'f'],
    第五步验证这是最大值: ['step', '5', 'verify', 'maximum'],
    第六步回到polymarket的特殊形式: ['step', '6', 'polymarket', 'special', 'case'],
    在量化交易中的作用: ['role', 'in', 'quantitative', 'trading'],
    什么是pi: ['what', 'is', 'pi'],
    什么是extension: ['what', 'is', 'extension'],
    什么是prompttemplates: ['what', 'is', 'prompt', 'templates'],
    什么是pipackage: ['what', 'is', 'pi', 'package'],
    pipackage推荐: ['pi', 'package', 'recommendations'],
    结语: ['conclusion'],
    不要让大模型做dirtyworktoken很贵attention很宝贵: [
      'dont',
      'make',
      'the',
      'llm',
      'do',
      'dirty',
      'work',
      'tokens',
      'are',
      'expensive',
      'attention',
      'is',
      'precious',
    ],
    skill不是银弹是软约束: ['skills', 'arent', 'silver', 'bullets', 'soft', 'constraints'],
    可观测性让测试集变得有价值: ['observability', 'makes', 'your', 'test', 'suite', 'valuable'],
    不要只做监督者要深度思考: ['dont', 'just', 'supervise', 'think', 'deeply'],
    博客计划的诞生: ['birth', 'of', 'the', 'blog', 'plan'],
    架构设计: ['architecture', 'design'],
    新技能get: ['new', 'skill', 'unlocked'],
    思考: ['reflections'],
    关于那场让人失望的活动: ['on', 'that', 'disappointing', 'event'],
    西溪的梅花救了这个周末: ['xixi', 'plum', 'blossoms', 'saved', 'the', 'weekend'],
    关于写作的边界: ['on', 'the', 'boundaries', 'of', 'writing'],
  }),
);

function normalizeHeadingKey(text) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/^\s*\d+(?:\.\d+)*\s*[.、:：-]?\s*/, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function getEnglishParts(text) {
  const translatedParts = translatedHeadings.get(normalizeHeadingKey(text));

  if (translatedParts) {
    return translatedParts;
  }

  const normalizedText = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const asciiParts = normalizedText.match(/[a-z0-9]+/g) ?? [];

  if (asciiParts.length === 0) {
    return [];
  }

  const parts = [];

  if (text.includes('什么是')) {
    parts.push('what', 'is');
  }

  parts.push(...asciiParts);

  if (text.includes('推荐')) {
    parts.push('recommendations');
  }

  return parts;
}

function createSlug(text, usedSlugs) {
  const parts = getEnglishParts(text);

  if (parts.length === 0) {
    return null;
  }

  const base = parts.join('-');

  let slug = base;
  let index = 1;

  while (usedSlugs.has(slug)) {
    index += 1;
    slug = `${base}-${index}`;
  }

  usedSlugs.add(slug);
  return slug;
}

function shouldProcessFile(file, include) {
  if (include.length === 0) {
    return true;
  }

  const paths = [...(file?.history ?? []), file?.path].filter(Boolean);
  return paths.some((filePath) => include.some((includedPath) => filePath.includes(includedPath)));
}

function visitHeadings(node, levels, usedSlugs, file) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'element' && /^h[2-4]$/.test(node.tagName) && !hasAnchorHeadingLink(node)) {
    const level = Number(node.tagName.slice(1));

    if (levels.has(level)) {
      const label = getTextContent(node).trim();
      const id = createSlug(label, usedSlugs);

      if (!id) {
        const filePath = file?.path ?? file?.history?.[0] ?? 'unknown file';

        throw new Error(
          `[anchor-headings] Missing short English heading anchor for "${label}" in ${filePath}. Add it to translatedHeadings or include an English phrase in the heading.`,
        );
      }

      node.properties ??= {};
      node.properties.id = id;

      node.children.unshift({
        type: 'element',
        tagName: 'a',
        properties: {
          ariaLabel: label ? `链接到：${label}` : '链接到此标题',
          className: ['heading-anchor'],
          href: `#${node.properties.id}`,
        },
        children: [{ type: 'text', value: '#' }],
      });
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitHeadings(child, levels, usedSlugs, file);
    }
  }
}

export function anchorHeadings(options = {}) {
  const levels = new Set(options.levels ?? [2, 3, 4]);
  const include = options.include ?? [];

  return (tree, file) => {
    if (!shouldProcessFile(file, include)) {
      return;
    }

    visitHeadings(tree, levels, new Set(), file);
  };
}
