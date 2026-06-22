import { createHeadingSlug } from './heading-slugs.mjs';

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

function getExistingId(node) {
  const id = node.properties?.id;

  return typeof id === 'string' && id.trim() ? id : null;
}

function createAriaLabel(label, prefix) {
  return label ? `${prefix}: ${label}` : `${prefix}: this heading`;
}

function shouldProcessFile(file, include) {
  if (include.length === 0) {
    return true;
  }

  const paths = [...(file?.history ?? []), file?.path].filter(Boolean);
  return paths.some((filePath) => include.some((includedPath) => filePath.includes(includedPath)));
}

function visitHeadings(node, levels, usedSlugs, file, ariaLabelPrefix) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (node.type === 'element' && /^h[2-4]$/.test(node.tagName) && !hasAnchorHeadingLink(node)) {
    const level = Number(node.tagName.slice(1));

    if (levels.has(level)) {
      const label = getTextContent(node).trim();
      node.properties ??= {};

      let id = getExistingId(node);

      if (!id) {
        id = createHeadingSlug(label, usedSlugs);

        if (!id) {
          const filePath = file?.path ?? file?.history?.[0] ?? 'unknown file';

          throw new Error(
            `[anchor-headings] Missing short English heading anchor for "${label}" in ${filePath}. Add it to translatedHeadings or include an English phrase in the heading.`,
          );
        }

        node.properties.id = id;
      } else {
        usedSlugs.add(id);
      }

      node.children.unshift({
        type: 'element',
        tagName: 'a',
        properties: {
          ariaLabel: createAriaLabel(label, ariaLabelPrefix),
          className: ['heading-anchor'],
          href: `#${id}`,
        },
        children: [{ type: 'text', value: '#' }],
      });
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      visitHeadings(child, levels, usedSlugs, file, ariaLabelPrefix);
    }
  }
}

export function anchorHeadings(options = {}) {
  const ariaLabelPrefix = options.ariaLabelPrefix ?? 'Link to';
  const levels = new Set(options.levels ?? [2, 3, 4]);
  const include = options.include ?? [];

  return (tree, file) => {
    if (!shouldProcessFile(file, include)) {
      return;
    }

    visitHeadings(tree, levels, new Set(), file, ariaLabelPrefix);
  };
}
