import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
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
const TICK_SHORT_WIDTH = 22;
const TICK_LONG_WIDTH = 34;
const TICK_SIDE_HYSTERESIS = 0.75;
const HEADER_OFFSET = 96;
const SCROLL_IDLE_MS = 180;
const BULGE_AMPLITUDE = DOT_SIZE * 2;
const BULGE_SIGMA = 36;
// Connector-line geometry, measured from the reference recording (ball = 16px).
const LINE_WIDTH = 44;
const LINE_TRANSLATE_X = DOT_SIZE + 18;
const ACTIVE_LABEL_TRANSLATE_X = 54;
// Underdamped spring fitted to the reference ball motion (~9% overshoot, ζ≈0.6).
const BALL_SPRING = { stiffness: 380, damping: 24, restDelta: 0.1, restSpeed: 1 };
const MAX_FRAME_DT = 1 / 30;
// The tick-to-line morph is driven purely by ball proximity so the ball
// visibly "pushes" the tick into a line as it arrives, instead of the
// target row morphing ahead of the ball.
const MORPH_RADIUS = 24;

interface TickMark {
  y: number;
  kind: 'long' | 'short';
  itemIndex?: number;
}

export interface CrispTocSpringState {
  position: number;
  velocity: number;
}

interface CrispTocSpringConfig {
  stiffness: number;
  damping: number;
  restDelta: number;
  restSpeed: number;
}

export function stepCrispTocSpring(
  state: CrispTocSpringState,
  target: number,
  dt: number,
  config: CrispTocSpringConfig = BALL_SPRING,
): CrispTocSpringState {
  const displacement = target - state.position;
  const velocity =
    state.velocity + (config.stiffness * displacement - config.damping * state.velocity) * dt;
  const position = state.position + velocity * dt;

  if (Math.abs(target - position) < config.restDelta && Math.abs(velocity) < config.restSpeed) {
    return { position: target, velocity: 0 };
  }

  return { position, velocity };
}

function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function getCrispTocMorphProgress(distance: number): number {
  const t = Math.max(0, 1 - Math.abs(distance) / MORPH_RADIUS);
  return t * t * (3 - 2 * t);
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

function gaussianInfluence(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

export function buildCrispTocTickMarks(itemCenters: number[]): TickMark[] {
  if (itemCenters.length === 0) {
    return [];
  }

  const ticks: TickMark[] = [];
  const firstGap = itemCenters.length > 1 ? itemCenters[1] - itemCenters[0] : 0;
  const lastGap = itemCenters.length > 1 ? itemCenters.at(-1)! - itemCenters.at(-2)! : 0;

  if (firstGap > 0) {
    ticks.push({ y: itemCenters[0] - firstGap / 3, kind: 'short' });
  }

  for (let index = 0; index < itemCenters.length; index += 1) {
    ticks.push({ y: itemCenters[index], kind: 'long', itemIndex: index });

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

  if (lastGap > 0) {
    ticks.push({ y: itemCenters.at(-1)! + lastGap / 3, kind: 'short' });
  }

  return ticks;
}

function getWaveOffset(dotY: number, y: number): number {
  return gaussianInfluence(y - dotY, BULGE_SIGMA) * BULGE_AMPLITUDE;
}

export function getNearestCrispTocItemIndex(itemCenters: number[], y: number): number {
  if (itemCenters.length === 0) {
    return 0;
  }

  return itemCenters.reduce((nearestIndex, center, centerIndex) => {
    const nearestCenter = itemCenters[nearestIndex] ?? 0;
    return Math.abs(center - y) < Math.abs(nearestCenter - y) ? centerIndex : nearestIndex;
  }, 0);
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

// Inverse of getScrollSpyTargetY: while dragging, the ball scrubs the page.
export function getCrispTocScrollTopForBallY(
  ballY: number,
  itemCenters: number[],
  headingTops: (number | null)[],
  headerOffset: number,
): number | null {
  if (itemCenters.length === 0) {
    return null;
  }

  const firstCenter = itemCenters[0];
  const lastCenter = itemCenters.at(-1) ?? firstCenter;
  const y = Math.max(firstCenter, Math.min(lastCenter, ballY));

  for (let index = 0; index < itemCenters.length - 1; index += 1) {
    const startCenter = itemCenters[index];
    const endCenter = itemCenters[index + 1];
    const startTop = headingTops[index];
    const endTop = headingTops[index + 1];
    if (startTop === null || endTop === null) {
      continue;
    }

    if (y >= startCenter && y <= endCenter) {
      const progress = (y - startCenter) / Math.max(endCenter - startCenter, 1);
      return startTop + progress * (endTop - startTop) - headerOffset;
    }
  }

  for (let index = headingTops.length - 1; index >= 0; index -= 1) {
    const top = headingTops[index];
    if (top !== null) {
      return top - headerOffset;
    }
  }

  return null;
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

// Flips each tick's remembered side of the ball and returns how many ticks
// were crossed. Runs every frame so the map stays fresh even while muted.
export function updateCrispTocTickSides(sides: Map<number, -1 | 1>, displayY: number): number {
  let crossings = 0;

  for (const [tickY, previousSide] of sides.entries()) {
    let nextSide = previousSide;

    if (displayY >= tickY + TICK_SIDE_HYSTERESIS) {
      nextSide = 1;
    } else if (displayY <= tickY - TICK_SIDE_HYSTERESIS) {
      nextSide = -1;
    }

    if (nextSide !== previousSide) {
      crossings += 1;
      sides.set(tickY, nextSide);
    }
  }

  return crossings;
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
  const ballVelocityRef = useRef(0);
  const lastFrameTimeRef = useRef<number | undefined>(undefined);
  const tickSideRef = useRef<Map<number, -1 | 1>>(new Map());
  const itemCentersRef = useRef<number[]>([]);
  const lockedIndexRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<number | undefined>(undefined);
  const isDraggingRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragCleanupRef = useRef<(() => void) | undefined>(undefined);

  const isControlled = index !== undefined;
  const [internalIndex, setInternalIndex] = useState(() => clampIndex(defaultIndex, items.length));
  const [activeTheme, setActiveTheme] = useState<(typeof THEME_OPTIONS)[number]>('Crisp');
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

    const tickMarks = buildCrispTocTickMarks(centers);
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
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

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
      if (isDraggingRef.current) {
        return;
      }

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

    // Only the drag ratchets audibly: click/scroll jumps sweep too many ticks
    // too fast and stack into a harsh burst. The side map is still updated on
    // silent frames so a later drag doesn't start with stale crossings.
    const trackTickCrossings = (displayY: number, audible: boolean) => {
      const crossings = updateCrispTocTickSides(tickSideRef.current, displayY);

      if (!audible || !soundEnabled || prefersReducedMotion) {
        return;
      }

      for (let index = 0; index < crossings; index += 1) {
        playCrispTickSound();
      }
    };

    const step = (timestamp: number) => {
      const lastTime = lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      const dt = lastTime === undefined ? 0 : Math.min((timestamp - lastTime) / 1000, MAX_FRAME_DT);

      if (isDraggingRef.current) {
        trackTickCrossings(displayYRef.current, true);
        frameRef.current = window.requestAnimationFrame(step);
        return;
      }

      if (scrollSpy && lockedIndexRef.current === null) {
        targetYRef.current = getScrollSpyTargetY(itemCentersRef.current, items);
      }

      const targetY = targetYRef.current;
      let displayY = displayYRef.current;

      if (prefersReducedMotion) {
        displayY = targetY;
        ballVelocityRef.current = 0;
      } else {
        const next = stepCrispTocSpring(
          { position: displayY, velocity: ballVelocityRef.current },
          targetY,
          dt,
        );
        displayY = next.position;
        ballVelocityRef.current = next.velocity;
      }

      const previousY = previousYRef.current;

      trackTickCrossings(displayY, false);

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
  const tickMarks = buildCrispTocTickMarks(itemCenters);
  // Exactly one tick is inked at a time: the one under the ball's center.
  const nearestTickIndex = getNearestCrispTocItemIndex(
    tickMarks.map((tick) => tick.y),
    displayY,
  );

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

  const getConstrainedDragY = useCallback((clientY: number) => {
    const body = bodyRef.current;
    const centers = itemCentersRef.current;
    if (!body || centers.length === 0) {
      return 0;
    }

    const bodyRect = body.getBoundingClientRect();
    const localY = clientY - bodyRect.top;
    const firstCenter = centers[0] ?? 0;
    const lastCenter = centers.at(-1) ?? firstCenter;

    return Math.max(firstCenter, Math.min(lastCenter, localY));
  }, []);

  const updateDragPosition = useCallback(
    (clientY: number) => {
      const centers = itemCentersRef.current;
      if (centers.length === 0) {
        return;
      }

      const nextY = getConstrainedDragY(clientY);
      const nextIndex = getNearestCrispTocItemIndex(centers, nextY);

      displayYRef.current = nextY;
      previousYRef.current = nextY;
      targetYRef.current = nextY;
      ballVelocityRef.current = 0;
      lockedIndexRef.current = null;
      setActiveIndex(nextIndex);
      setRenderTick((value) => value + 1);

      if (scrollSpy) {
        // Scrub mode: the ball drives the page while dragging.
        const headingTops = items.map((item) => getHeadingDocumentTop(item.id));
        const scrollTop = getCrispTocScrollTopForBallY(nextY, centers, headingTops, HEADER_OFFSET);
        if (scrollTop !== null) {
          window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'instant' });
        }
      }
    },
    [getConstrainedDragY, items, scrollSpy, setActiveIndex],
  );

  const cleanupDragListeners = useCallback(() => {
    dragCleanupRef.current?.();
    dragCleanupRef.current = undefined;
  }, []);

  const finishDrag = useCallback(() => {
    if (!isDraggingRef.current) {
      return;
    }

    const centers = itemCentersRef.current;
    const nextIndex = getNearestCrispTocItemIndex(centers, displayYRef.current);
    const nextY = centers[nextIndex] ?? displayYRef.current;

    isDraggingRef.current = false;
    dragPointerIdRef.current = null;
    cleanupDragListeners();
    setIsDragging(false);

    if (scrollSpy) {
      // The page already sits where the scrub left it: record the section in
      // the URL and hand the ball back to scroll tracking without jumping.
      const item = items[nextIndex];
      if (item) {
        history.replaceState(null, '', `#${item.id}`);
      }
      setActiveIndex(nextIndex);
      return;
    }

    targetYRef.current = nextY;
    navigateToItem(nextIndex);
  }, [cleanupDragListeners, items, navigateToItem, scrollSpy, setActiveIndex]);

  const onBallPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (soundEnabled) {
        primeCrispTickSound();
      }

      isDraggingRef.current = true;
      dragPointerIdRef.current = event.pointerId;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      updateDragPosition(event.clientY);

      cleanupDragListeners();

      const pointerId = event.pointerId;
      const onWindowPointerMove = (pointerEvent: globalThis.PointerEvent) => {
        if (dragPointerIdRef.current !== pointerId) {
          return;
        }

        pointerEvent.preventDefault();
        updateDragPosition(pointerEvent.clientY);
      };
      const onWindowPointerUp = (pointerEvent: globalThis.PointerEvent) => {
        if (dragPointerIdRef.current !== pointerId) {
          return;
        }

        pointerEvent.preventDefault();
        updateDragPosition(pointerEvent.clientY);
        finishDrag();
      };

      window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
      window.addEventListener('pointerup', onWindowPointerUp, { passive: false });
      window.addEventListener('pointercancel', onWindowPointerUp, { passive: false });

      dragCleanupRef.current = () => {
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('pointerup', onWindowPointerUp);
        window.removeEventListener('pointercancel', onWindowPointerUp);
      };
    },
    [cleanupDragListeners, finishDrag, soundEnabled, updateDragPosition],
  );

  const onBallPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();
      updateDragPosition(event.clientY);
    },
    [updateDragPosition],
  );

  const onBallPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (dragPointerIdRef.current !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.currentTarget.releasePointerCapture(event.pointerId);
      finishDrag();
    },
    [finishDrag],
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
            className={`crisp-toc-ball ${isDragging ? 'is-dragging' : ''}`}
            style={{ transform: `translateY(${displayY}px) translateY(-50%)` }}
            onPointerDown={onBallPointerDown}
            onPointerMove={onBallPointerMove}
            onPointerUp={onBallPointerUp}
            onPointerCancel={onBallPointerUp}
          >
            <span className="crisp-toc-origin-dot" />
          </div>

          <div className="crisp-toc-scale">
            {tickMarks.map((tick, tickIndex) => {
              const waveOffset = getWaveOffset(displayY, tick.y);
              const progress =
                tick.itemIndex === undefined ? 0 : getCrispTocMorphProgress(tick.y - displayY);
              const baseWidth = tick.kind === 'long' ? TICK_LONG_WIDTH : TICK_SHORT_WIDTH;
              // A long tick is pushed into the connector line as the ball rolls onto it.
              const width = mix(baseWidth, LINE_WIDTH, progress);
              const offsetX = mix(waveOffset, LINE_TRANSLATE_X, progress);

              return (
                <span
                  key={tick.y}
                  className={`crisp-toc-tick ${tick.kind === 'long' ? 'is-long' : 'is-short'} ${
                    progress > 0.5 ? 'crisp-toc-line' : ''
                  }`.trim()}
                  style={{
                    top: `${tick.y}px`,
                    width: `${width}px`,
                    transform: `translateY(-50%) translateX(${offsetX}px)`,
                    ['--crisp-tick-heat' as string]: tickIndex === nearestTickIndex ? 1 : 0,
                  }}
                />
              );
            })}
          </div>
        </div>

        <ul ref={listRef} id={listId} className="crisp-toc-list">
          {items.map((item, itemIndex) => {
            const isActive = itemIndex === activeIndex;
            const itemCenter = itemCenters[itemIndex] ?? 0;
            const progress = getCrispTocMorphProgress(itemCenter - displayY);
            // The label is pushed aside as the ball arrives; inactive labels ride the wave.
            const offsetX = mix(
              getWaveOffset(displayY, itemCenter),
              ACTIVE_LABEL_TRANSLATE_X,
              progress,
            );
            // Shrink by the same offset so the shifted label re-wraps inside the lane
            // instead of overflowing the sidebar.
            const itemStyle = {
              transform: `translateX(${offsetX}px)`,
              width: `calc(100% - ${offsetX}px)`,
            };

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
                    style={itemStyle}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateToItem(itemIndex, event.nativeEvent);
                    }}
                  >
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`crisp-toc-item ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'location' : undefined}
                    style={itemStyle}
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
