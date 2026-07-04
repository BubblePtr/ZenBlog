import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { playCrispTickSound, primeCrispTickSound } from './crisp-toc-sound';

export interface CrispTocItem {
  id: string;
  label: string;
}

export interface CrispTocProps {
  items?: CrispTocItem[];
  defaultIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
  soundEnabled?: boolean;
  showThemeBar?: boolean;
  showFooter?: boolean;
  scrollSpy?: boolean;
  proseSelector?: string;
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_ITEMS: CrispTocItem[] = [
  { id: 'user-info', label: 'User Info' },
  { id: 'company-address', label: 'Company Address' },
  { id: 'ownership-details', label: 'Ownership Details' },
  { id: 'company-details', label: 'Company Details' },
  { id: 'expected-activity', label: 'Expected Activity' },
  { id: 'follow-up-questions', label: 'Follow-up Questions' },
];

const THEME_OPTIONS = ['Current', 'Crisp', 'Wood', 'Glassy', 'Tape'] as const;

const DOT_SIZE = 16;
const DOT_LERP = 0.14;
const TICK_SHORT_WIDTH = 10;
const TICK_LONG_WIDTH = 22;
const TICK_SIDE_HYSTERESIS = 0.75;
const HEADER_OFFSET = 96;
const SCROLL_IDLE_MS = 180;
const BULGE_AMPLITUDE = DOT_SIZE * 2;
const BULGE_SIGMA = 36;

interface TickMark {
  y: number;
  kind: 'long' | 'short';
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

function gaussianInfluence(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function buildTickMarks(itemCenters: number[]): TickMark[] {
  if (itemCenters.length === 0) {
    return [];
  }

  const ticks: TickMark[] = [];

  for (let index = 0; index < itemCenters.length; index += 1) {
    ticks.push({ y: itemCenters[index], kind: 'long' });

    const nextCenter = itemCenters[index + 1];
    if (nextCenter === undefined) {
      continue;
    }

    const gap = nextCenter - itemCenters[index];
    ticks.push(
      { y: itemCenters[index] + gap / 3, kind: 'short' },
      { y: itemCenters[index] + (gap * 2) / 3, kind: 'short' },
    );
  }

  return ticks;
}

function getWaveOffset(dotY: number, y: number): number {
  return gaussianInfluence(y - dotY, BULGE_SIGMA) * BULGE_AMPLITUDE;
}

function getTickMetrics(dotY: number, tickY: number, kind: TickMark['kind']) {
  const influence = gaussianInfluence(tickY - dotY, BULGE_SIGMA);

  return {
    width: kind === 'long' ? TICK_LONG_WIDTH : TICK_SHORT_WIDTH,
    offsetX: influence * BULGE_AMPLITUDE,
    opacity: 0.22 + influence * 0.52,
  };
}

function getHeadingDocumentTop(id: string): number | null {
  const heading = document.getElementById(id);
  if (!heading) {
    return null;
  }

  return heading.getBoundingClientRect().top + window.scrollY;
}

function getScrollSpyTargetY(itemCenters: number[], items: CrispTocItem[]): number {
  if (itemCenters.length === 0 || items.length === 0) {
    return 0;
  }

  const headingTops = items.map((item) => getHeadingDocumentTop(item.id));
  const firstTop = headingTops[0];
  if (firstTop === null) {
    return itemCenters[0] ?? 0;
  }

  const scrollAnchor = window.scrollY + HEADER_OFFSET;

  if (scrollAnchor <= firstTop) {
    return itemCenters[0] ?? 0;
  }

  const lastIndex = items.length - 1;
  const lastTop = headingTops[lastIndex];
  if (lastTop !== null && scrollAnchor >= lastTop) {
    return itemCenters[lastIndex] ?? 0;
  }

  for (let index = 0; index < items.length - 1; index += 1) {
    const start = headingTops[index];
    const end = headingTops[index + 1];
    if (start === null || end === null) {
      continue;
    }

    if (scrollAnchor >= start && scrollAnchor < end) {
      const progress = (scrollAnchor - start) / Math.max(end - start, 1);
      const currentY = itemCenters[index] ?? 0;
      const nextY = itemCenters[index + 1] ?? currentY;
      return currentY + (nextY - currentY) * progress;
    }
  }

  return itemCenters[lastIndex] ?? 0;
}

function getScrollSpyActiveIndex(items: CrispTocItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const scrollAnchor = window.scrollY + HEADER_OFFSET;
  let activeIndex = 0;

  for (let index = 0; index < items.length; index += 1) {
    const top = getHeadingDocumentTop(items[index].id);
    if (top !== null && scrollAnchor >= top) {
      activeIndex = index;
    }
  }

  return activeIndex;
}

function shouldHandleItemClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function CrispToc({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  index,
  onIndexChange,
  soundEnabled = true,
  showThemeBar = true,
  showFooter = true,
  scrollSpy = false,
  proseSelector = '.article-prose',
  ariaLabel = 'Section navigation',
  className = '',
}: CrispTocProps) {
  const listId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const displayYRef = useRef(0);
  const targetYRef = useRef(0);
  const previousYRef = useRef(0);
  const tickSideRef = useRef<Map<number, -1 | 1>>(new Map());
  const itemCentersRef = useRef<number[]>([]);
  const lockedIndexRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<number | undefined>(undefined);

  const isControlled = index !== undefined;
  const [internalIndex, setInternalIndex] = useState(() => clampIndex(defaultIndex, items.length));
  const [activeTheme, setActiveTheme] = useState<(typeof THEME_OPTIONS)[number]>('Crisp');
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [, setRenderTick] = useState(0);

  const activeIndex = clampIndex(isControlled ? index : internalIndex, items.length);

  const setActiveIndex = useCallback(
    (nextIndex: number) => {
      const clamped = clampIndex(nextIndex, items.length);
      if (!isControlled) {
        setInternalIndex(clamped);
      }
      onIndexChange?.(clamped);
    },
    [isControlled, items.length, onIndexChange],
  );

  const releaseClickLock = useCallback(() => {
    lockedIndexRef.current = null;
  }, []);

  const scheduleClickLockRelease = useCallback(() => {
    window.clearTimeout(scrollIdleTimerRef.current);
    scrollIdleTimerRef.current = window.setTimeout(releaseClickLock, SCROLL_IDLE_MS);
  }, [releaseClickLock]);

  const syncScrollSpyTarget = useCallback(() => {
    const centers = itemCentersRef.current;
    if (lockedIndexRef.current !== null) {
      targetYRef.current = centers[lockedIndexRef.current] ?? targetYRef.current;
      setActiveIndex(lockedIndexRef.current);
      return;
    }

    targetYRef.current = getScrollSpyTargetY(centers, items);
    setActiveIndex(getScrollSpyActiveIndex(items));
  }, [items, setActiveIndex]);

  const measureLayout = useCallback(() => {
    const body = bodyRef.current;
    const list = listRef.current;

    if (!body || !list) {
      return;
    }

    const listTop = list.offsetTop;
    const centers = items.map((_, itemIndex) => {
      const item = itemRefs.current[itemIndex];
      if (!item) {
        return 0;
      }

      return listTop + item.offsetTop + item.offsetHeight / 2;
    });

    itemCentersRef.current = centers;

    const first = centers[0] ?? 0;
    if (!scrollSpy) {
      targetYRef.current = centers[activeIndex] ?? first;
    } else {
      syncScrollSpyTarget();
    }

    if (displayYRef.current === 0) {
      displayYRef.current = targetYRef.current;
      previousYRef.current = displayYRef.current;
    }

    const tickMarks = buildTickMarks(centers);
    const nextTickSide = new Map<number, -1 | 1>();

    for (const tick of tickMarks) {
      nextTickSide.set(tick.y, displayYRef.current >= tick.y ? 1 : -1);
    }

    tickSideRef.current = nextTickSide;
    setLayoutVersion((value) => value + 1);
  }, [activeIndex, items, scrollSpy, syncScrollSpyTarget]);

  useLayoutEffect(() => {
    measureLayout();
  }, [measureLayout, items, activeIndex]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureLayout();
    });

    observer.observe(body);
    window.addEventListener('resize', measureLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureLayout);
    };
  }, [measureLayout]);

  useEffect(() => {
    if (scrollSpy) {
      return;
    }

    const centers = itemCentersRef.current;
    targetYRef.current = centers[activeIndex] ?? targetYRef.current;
  }, [activeIndex, layoutVersion, scrollSpy]);

  useEffect(() => {
    if (!scrollSpy) {
      return;
    }

    const onScroll = () => {
      if (lockedIndexRef.current !== null) {
        targetYRef.current = itemCentersRef.current[lockedIndexRef.current] ?? targetYRef.current;
        setActiveIndex(lockedIndexRef.current);
        scheduleClickLockRelease();
        return;
      }

      syncScrollSpyTarget();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    syncScrollSpyTarget();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(scrollIdleTimerRef.current);
    };
  }, [scheduleClickLockRelease, scrollSpy, setActiveIndex, syncScrollSpyTarget, layoutVersion]);

  useEffect(() => {
    if (!scrollSpy) {
      return;
    }

    const prose = document.querySelector<HTMLElement>(proseSelector);
    if (!prose) {
      return;
    }

    const observer = new MutationObserver(() => {
      measureLayout();
    });

    observer.observe(prose, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [measureLayout, proseSelector, scrollSpy]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const step = () => {
      if (scrollSpy && lockedIndexRef.current === null) {
        targetYRef.current = getScrollSpyTargetY(itemCentersRef.current, items);
      }

      const targetY = targetYRef.current;
      let displayY = displayYRef.current;

      if (prefersReducedMotion) {
        displayY = targetY;
      } else {
        displayY += (targetY - displayY) * DOT_LERP;
        if (Math.abs(targetY - displayY) < 0.25) {
          displayY = targetY;
        }
      }

      const previousY = previousYRef.current;

      if (soundEnabled && !prefersReducedMotion) {
        for (const [tickY, previousSide] of tickSideRef.current.entries()) {
          let nextSide = previousSide;

          if (displayY >= tickY + TICK_SIDE_HYSTERESIS) {
            nextSide = 1;
          } else if (displayY <= tickY - TICK_SIDE_HYSTERESIS) {
            nextSide = -1;
          }

          if (nextSide !== previousSide) {
            playCrispTickSound();
            tickSideRef.current.set(tickY, nextSide);
          }
        }
      }

      displayYRef.current = displayY;
      previousYRef.current = displayY;

      if (Math.abs(displayY - previousY) > 0.01 || Math.abs(targetY - displayY) > 0.01) {
        setRenderTick((value) => value + 1);
      }

      frameRef.current = window.requestAnimationFrame(step);
    };

    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== undefined) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [items, scrollSpy, soundEnabled, layoutVersion]);

  const displayY = displayYRef.current;
  const itemCenters = itemCentersRef.current;
  const tickMarks = buildTickMarks(itemCenters);

  const visualIndex = itemCenters.reduce((nearest, center, centerIndex) => {
    const nearestCenter = itemCenters[nearest] ?? 0;
    return Math.abs(center - displayY) < Math.abs(nearestCenter - displayY) ? centerIndex : nearest;
  }, activeIndex);

  const navigateToItem = useCallback(
    (itemIndex: number, event?: MouseEvent) => {
      primeCrispTickSound();
      setActiveIndex(itemIndex);

      if (!scrollSpy) {
        return;
      }

      const item = items[itemIndex];
      const target = document.getElementById(item.id);
      if (!target) {
        return;
      }

      if (event && !shouldHandleItemClick(event)) {
        return;
      }

      lockedIndexRef.current = itemIndex;
      targetYRef.current = itemCentersRef.current[itemIndex] ?? targetYRef.current;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${item.id}`);
      scheduleClickLockRelease();
    },
    [items, scheduleClickLockRelease, scrollSpy, setActiveIndex],
  );

  const moveBy = useCallback(
    (delta: number) => {
      navigateToItem(clampIndex(activeIndex + delta, items.length));
    },
    [activeIndex, items.length, navigateToItem],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveBy(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveBy(-1);
    }
  };

  return (
    <div
      className={`crisp-toc ${scrollSpy ? 'crisp-toc--article' : ''} ${className}`.trim()}
      tabIndex={scrollSpy ? -1 : 0}
      role="navigation"
      aria-label={ariaLabel}
      onKeyDown={scrollSpy ? undefined : onKeyDown}
      onPointerDown={soundEnabled ? primeCrispTickSound : undefined}
      data-article-toc={scrollSpy ? '' : undefined}
    >
      {showThemeBar ? (
        <div className="crisp-toc-theme-bar" aria-hidden="true">
          {THEME_OPTIONS.map((theme) => {
            const isActive = theme === activeTheme;

            return (
              <button
                key={theme}
                type="button"
                className={`crisp-toc-theme-pill ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveTheme(theme)}
                tabIndex={-1}
              >
                {theme}
              </button>
            );
          })}
        </div>
      ) : null}

      <div ref={bodyRef} className="crisp-toc-body">
        <div className="crisp-toc-rail" aria-hidden="true">
          <div
            className="crisp-toc-ball"
            style={{ transform: `translateY(${displayY}px) translateY(-50%)` }}
          >
            <span className="crisp-toc-origin-ring" />
            <span className="crisp-toc-origin-dot" />
          </div>

          <div className="crisp-toc-scale">
            {tickMarks.map((tick) => {
              const { width, offsetX, opacity } = getTickMetrics(displayY, tick.y, tick.kind);

              return (
                <span
                  key={tick.y}
                  className={`crisp-toc-tick ${tick.kind === 'long' ? 'is-long' : 'is-short'}`}
                  style={{
                    top: `${tick.y}px`,
                    width: `${width}px`,
                    opacity,
                    transform: `translateY(-50%) translateX(${offsetX}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <ul ref={listRef} id={listId} className="crisp-toc-list">
          {items.map((item, itemIndex) => {
            const isActive = itemIndex === visualIndex;
            const itemCenter = itemCenters[itemIndex] ?? 0;
            const offsetX = getWaveOffset(displayY, itemCenter);

            return (
              <li
                key={item.id}
                ref={(node) => {
                  itemRefs.current[itemIndex] = node;
                }}
              >
                {scrollSpy ? (
                  <a
                    href={`#${item.id}`}
                    data-toc-link={item.id}
                    className={`crisp-toc-item ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'location' : undefined}
                    style={{ transform: `translateX(${offsetX}px)` }}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToItem(itemIndex, event.nativeEvent);
                    }}
                  >
                    <span className="line-clamp-2">{item.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`crisp-toc-item ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'location' : undefined}
                    style={{ transform: `translateX(${offsetX}px)` }}
                    onClick={() => {
                      navigateToItem(itemIndex);
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {showFooter ? (
        <div className="crisp-toc-footer">
          <button
            type="button"
            className="crisp-toc-nav-button"
            aria-label="Previous section"
            onClick={() => moveBy(-1)}
            disabled={activeIndex === 0}
          >
            <RiArrowUpLine aria-hidden="true" />
          </button>
          <button
            type="button"
            className="crisp-toc-nav-button"
            aria-label="Next section"
            onClick={() => moveBy(1)}
            disabled={activeIndex === items.length - 1}
          >
            <RiArrowDownLine aria-hidden="true" />
          </button>
          <span className="crisp-toc-hint">USE ↑↓ TO NAVIGATE</span>
        </div>
      ) : null}
    </div>
  );
}
