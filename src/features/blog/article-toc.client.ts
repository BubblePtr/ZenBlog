const PROSE_SELECTOR = '.article-prose';
const FLOW_LERP = 0.14;
const HEADER_OFFSET = 96;
const TOC_TOP_NUDGE = 6;
const SCROLL_IDLE_MS = 180;
const TAIL_FULL_SPEED = 1.8;
const TAIL_CHARGE = 0.75;
const TAIL_DISCHARGE = 0.08;
const TAIL_SCROLL_GAIN = 0.5;

function alignArticleTocAside(): void {
  const shell = document.querySelector<HTMLElement>('.article-body-shell');
  const prose = document.querySelector<HTMLElement>(PROSE_SELECTOR);
  const aside = document.querySelector<HTMLElement>('.article-toc-aside');
  const firstHeading = prose?.querySelector<HTMLElement>('h2[id]');

  if (!shell || !aside) {
    return;
  }

  if (!window.matchMedia('(min-width: 1280px)').matches) {
    aside.style.top = '';
    return;
  }

  if (!firstHeading) {
    return;
  }

  const shellRect = shell.getBoundingClientRect();
  const headingRect = firstHeading.getBoundingClientRect();
  const offset = headingRect.top - shellRect.top + TOC_TOP_NUDGE;

  aside.style.top = `${Math.max(0, offset)}px`;
}

function watchArticleTocLayout(): void {
  const prose = document.querySelector<HTMLElement>(PROSE_SELECTOR);
  if (!prose) {
    return;
  }

  for (const image of prose.querySelectorAll('img')) {
    if (!image.complete) {
      image.addEventListener('load', alignArticleTocAside, { once: true });
    }
  }
}

function getLinkCenterInList(link: HTMLElement, list: HTMLElement): number {
  const linkRect = link.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();

  return linkRect.top - listRect.top + linkRect.height / 2;
}

function setActiveLink(links: NodeListOf<HTMLAnchorElement>, nextId: string) {
  for (const link of links) {
    const isActive = link.dataset.tocLink === nextId;
    link.classList.toggle('is-active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

function getTocHeadings(
  prose: HTMLElement,
  linkById: Map<string, HTMLAnchorElement>,
): HTMLElement[] {
  return Array.from(prose.querySelectorAll<HTMLElement>('h2[id], h3[id]')).filter((heading) =>
    linkById.has(heading.id),
  );
}

function getHeadingDocumentTop(heading: HTMLElement): number {
  return heading.getBoundingClientRect().top + window.scrollY;
}

function getFlowTargetY(
  prose: HTMLElement,
  list: HTMLElement,
  linkById: Map<string, HTMLAnchorElement>,
): number {
  const headings = getTocHeadings(prose, linkById);
  if (headings.length === 0) {
    return 0;
  }

  const scrollAnchor = window.scrollY + HEADER_OFFSET;
  const first = headings[0];
  const firstLink = linkById.get(first.id);

  if (!firstLink) {
    return 0;
  }

  if (scrollAnchor <= getHeadingDocumentTop(first)) {
    return getLinkCenterInList(firstLink, list);
  }

  const last = headings.at(-1);
  const lastLink = last ? linkById.get(last.id) : undefined;

  if (last && lastLink && scrollAnchor >= getHeadingDocumentTop(last)) {
    return getLinkCenterInList(lastLink, list);
  }

  for (let index = 0; index < headings.length - 1; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    const currentLink = linkById.get(current.id);
    const nextLink = linkById.get(next.id);

    if (!currentLink || !nextLink) {
      continue;
    }

    const start = getHeadingDocumentTop(current);
    const end = getHeadingDocumentTop(next);

    if (scrollAnchor >= start && scrollAnchor < end) {
      const progress = (scrollAnchor - start) / Math.max(end - start, 1);
      const currentY = getLinkCenterInList(currentLink, list);
      const nextY = getLinkCenterInList(nextLink, list);

      return currentY + (nextY - currentY) * progress;
    }
  }

  return lastLink ? getLinkCenterInList(lastLink, list) : 0;
}

export function mountArticleTocScrollSpy(nav: HTMLElement): (() => void) | undefined {
  const prose = document.querySelector<HTMLElement>(PROSE_SELECTOR);
  const list = nav.querySelector<HTMLUListElement>('.article-toc-list');
  const flow = nav.querySelector<HTMLElement>('.article-toc-flow');
  const tail = nav.querySelector<HTMLElement>('.article-toc-flow-tail');

  if (!prose || !list || !flow || !tail) {
    return undefined;
  }

  const links = nav.querySelectorAll<HTMLAnchorElement>('[data-toc-link]');
  if (links.length === 0) {
    return undefined;
  }

  const linkById = new Map(
    [...links].flatMap((link) => {
      const id = link.dataset.tocLink;
      return id ? [[id, link] as const] : [];
    }),
  );

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetY = getFlowTargetY(prose, list, linkById);
  let displayY = targetY;
  let previousDisplayY = displayY;
  let previousTargetY = targetY;
  let previousScrollY = window.scrollY;
  let tailScale = 0;
  let frameId = 0;
  let lockedLinkId: string | null = null;
  let scrollIdleTimer: number | undefined;

  const releaseClickLock = () => {
    lockedLinkId = null;
    updateTarget();
  };

  const scheduleClickLockRelease = () => {
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(releaseClickLock, SCROLL_IDLE_MS);
  };

  const snapToLink = (id: string, snapDot = false) => {
    const link = linkById.get(id);
    if (!link) {
      return;
    }

    const y = getLinkCenterInList(link, list);
    targetY = y;

    if (snapDot) {
      displayY = y;
      previousDisplayY = y;
      previousTargetY = y;
      tailScale = 0;
      applyFlowPosition(displayY);
      applyTailMotion(0, 0, 0);
    }

    setActiveLink(links, id);
  };

  const applyFlowPosition = (y: number) => {
    flow.style.transform = `translate3d(-2px, ${y}px, 0) translateY(-50%)`;
  };

  const applyTailMotion = (delta: number, targetDelta: number, scrollDelta: number) => {
    if (prefersReducedMotion) {
      tail.style.opacity = '0';
      tail.style.transform = 'translateX(-50%) scaleY(0)';
      return;
    }

    const frameSpeed = Math.abs(delta);
    const scrollSpeed = Math.abs(scrollDelta) * TAIL_SCROLL_GAIN;
    const guideSpeed = Math.abs(targetDelta);
    const chaseSpeed = Math.abs(targetY - displayY) * FLOW_LERP;
    const speed = Math.max(frameSpeed, scrollSpeed, guideSpeed, chaseSpeed);
    const targetEnergy = Math.min(1, speed / TAIL_FULL_SPEED);
    const blend = targetEnergy >= tailScale ? TAIL_CHARGE : TAIL_DISCHARGE;

    tailScale += (targetEnergy - tailScale) * blend;

    if (tailScale < 0.01) {
      tailScale = 0;
    }

    const motionSign = scrollDelta !== 0 ? scrollDelta : delta + targetDelta;

    if (Math.abs(motionSign) > 0.02) {
      flow.classList.toggle('is-ascending', motionSign < 0);
    }

    if (tailScale === 0) {
      tail.style.opacity = '0';
      tail.style.transform = 'translateX(-50%) scaleY(0)';
      return;
    }

    tail.style.opacity = String(0.5 + tailScale * 0.5);
    tail.style.transform = `translateX(-50%) scaleY(${tailScale})`;
  };

  const updateTarget = () => {
    if (lockedLinkId) {
      snapToLink(lockedLinkId);
      return;
    }

    targetY = getFlowTargetY(prose, list, linkById);
  };

  const findNearestLinkId = (y: number): string => {
    let nearestId = links[0]?.dataset.tocLink ?? '';
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const link of links) {
      const id = link.dataset.tocLink;
      if (!id) {
        continue;
      }

      const distance = Math.abs(getLinkCenterInList(link, list) - y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    }

    return nearestId;
  };

  const animate = () => {
    if (!lockedLinkId) {
      targetY = getFlowTargetY(prose, list, linkById);
    }

    if (prefersReducedMotion) {
      displayY = targetY;
    } else {
      displayY += (targetY - displayY) * FLOW_LERP;

      if (Math.abs(targetY - displayY) < 0.35) {
        displayY = targetY;
      }
    }

    const delta = displayY - previousDisplayY;
    const targetDelta = targetY - previousTargetY;
    const scrollDelta = window.scrollY - previousScrollY;

    applyFlowPosition(displayY);
    applyTailMotion(delta, targetDelta, scrollDelta);
    previousDisplayY = displayY;
    previousTargetY = targetY;
    previousScrollY = window.scrollY;

    if (!lockedLinkId) {
      setActiveLink(links, findNearestLinkId(displayY));
    }

    frameId = window.requestAnimationFrame(animate);
  };

  applyFlowPosition(displayY);
  setActiveLink(links, findNearestLinkId(displayY));
  frameId = window.requestAnimationFrame(animate);

  const onScroll = () => {
    if (lockedLinkId) {
      snapToLink(lockedLinkId);
      scheduleClickLockRelease();
      return;
    }

    updateTarget();
  };

  const onResize = () => {
    alignArticleTocAside();

    if (lockedLinkId) {
      snapToLink(lockedLinkId, true);
      return;
    }

    updateTarget();
    displayY = prefersReducedMotion ? targetY : displayY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  for (const link of links) {
    link.addEventListener('click', (event) => {
      const id = link.dataset.tocLink;
      if (!id) {
        return;
      }

      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      event.preventDefault();
      lockedLinkId = id;
      snapToLink(id, true);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      scheduleClickLockRelease();
    });
  }

  return () => {
    window.cancelAnimationFrame(frameId);
    window.clearTimeout(scrollIdleTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}

export function initArticleTocScrollSpy(): void {
  const nav = document.querySelector<HTMLElement>('[data-article-toc]');
  if (!nav) {
    return;
  }

  alignArticleTocAside();
  watchArticleTocLayout();

  const existingCleanup = (nav as HTMLElement & { __tocCleanup?: () => void }).__tocCleanup;
  existingCleanup?.();

  const cleanup = mountArticleTocScrollSpy(nav);
  if (cleanup) {
    (nav as HTMLElement & { __tocCleanup?: () => void }).__tocCleanup = cleanup;
  }
}
