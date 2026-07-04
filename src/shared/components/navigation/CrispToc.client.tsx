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

const TICK_STEP = 8;
const DOT_LERP = 0.14;
const TICK_SHORT_WIDTH = 10;
const TICK_LONG_WIDTH = 22;
const TICK_SIDE_HYSTERESIS = 0.75;
const BULGE_AMPLITUDE = 14;
const BULGE_SIGMA = 36;

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index));
}

function gaussianInfluence(distance: number, sigma: number): number {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function isLongTick(tickIndex: number): boolean {
  return tickIndex % 3 === 0;
}

function getTickMetrics(dotY: number, tickY: number, tickIndex: number) {
  const distance = tickY - dotY;
  const influence = gaussianInfluence(distance, BULGE_SIGMA);

  return {
    width: isLongTick(tickIndex) ? TICK_LONG_WIDTH : TICK_SHORT_WIDTH,
    offsetX: influence * BULGE_AMPLITUDE,
    opacity: 0.22 + influence * 0.52,
  };
}

export default function CrispToc({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  index,
  onIndexChange,
  soundEnabled = true,
  showThemeBar = true,
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

  const measureLayout = useCallback(() => {
    const body = bodyRef.current;
    const list = listRef.current;

    if (!body || !list) {
      return;
    }

    const bodyRect = body.getBoundingClientRect();
    const centers = items.map((_, itemIndex) => {
      const item = itemRefs.current[itemIndex];
      if (!item) {
        return 0;
      }

      const rect = item.getBoundingClientRect();
      return rect.top - bodyRect.top + rect.height / 2;
    });

    itemCentersRef.current = centers;

    const first = centers[0] ?? 0;
    const last = centers.at(-1) ?? first;
    targetYRef.current = centers[activeIndex] ?? first;

    if (displayYRef.current === 0) {
      displayYRef.current = targetYRef.current;
      previousYRef.current = displayYRef.current;
    }

    const tickCount = Math.max(2, Math.ceil((last - first) / TICK_STEP) + 1);
    const nextTickSide = new Map<number, -1 | 1>();

    for (let tickIndex = 0; tickIndex < tickCount; tickIndex += 1) {
      const tickY = first + tickIndex * TICK_STEP;
      nextTickSide.set(tickY, displayYRef.current >= tickY ? 1 : -1);
    }

    tickSideRef.current = nextTickSide;
    setLayoutVersion((value) => value + 1);
  }, [activeIndex, items]);

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
    const centers = itemCentersRef.current;
    targetYRef.current = centers[activeIndex] ?? targetYRef.current;
  }, [activeIndex, layoutVersion]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const step = () => {
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
  }, [soundEnabled, layoutVersion]);

  const displayY = displayYRef.current;
  const itemCenters = itemCentersRef.current;
  const firstCenter = itemCenters[0] ?? 0;
  const lastCenter = itemCenters.at(-1) ?? firstCenter;
  const tickCount = Math.max(2, Math.ceil((lastCenter - firstCenter) / TICK_STEP) + 1);
  const tickMarks = Array.from(
    { length: tickCount },
    (_, tickIndex) => firstCenter + tickIndex * TICK_STEP,
  );

  const visualIndex = itemCenters.reduce((nearest, center, centerIndex) => {
    const nearestCenter = itemCenters[nearest] ?? 0;
    return Math.abs(center - displayY) < Math.abs(nearestCenter - displayY) ? centerIndex : nearest;
  }, activeIndex);

  const moveBy = useCallback(
    (delta: number) => {
      primeCrispTickSound();
      setActiveIndex(activeIndex + delta);
    },
    [activeIndex, setActiveIndex],
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
      className={`crisp-toc ${className}`.trim()}
      tabIndex={0}
      role="navigation"
      aria-label="Section navigation"
      onKeyDown={onKeyDown}
      onPointerDown={primeCrispTickSound}
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
            {tickMarks.map((tickY, tickIndex) => {
              const { width, offsetX, opacity } = getTickMetrics(displayY, tickY, tickIndex);

              return (
                <span
                  key={tickY}
                  className={`crisp-toc-tick ${isLongTick(tickIndex) ? 'is-long' : 'is-short'}`}
                  style={{
                    top: `${tickY}px`,
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

            return (
              <li
                key={item.id}
                ref={(node) => {
                  itemRefs.current[itemIndex] = node;
                }}
              >
                <button
                  type="button"
                  className={`crisp-toc-item ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => {
                    primeCrispTickSound();
                    setActiveIndex(itemIndex);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

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
    </div>
  );
}
