import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  buildCrispTocTickMarks,
  getCrispTocMorphProgress,
  getCrispTocScrollTopForBallY,
  getNearestCrispTocItemIndex,
  stepCrispTocSpring,
  updateCrispTocTickSides,
} from '@/shared/components/navigation/CrispToc.client';

describe('getNearestCrispTocItemIndex', () => {
  test('selects the item center closest to the dragged ball position', () => {
    expect(getNearestCrispTocItemIndex([12, 48, 84], 46)).toBe(1);
    expect(getNearestCrispTocItemIndex([12, 48, 84], 78)).toBe(2);
  });

  test('clamps empty and out-of-range drag positions', () => {
    expect(getNearestCrispTocItemIndex([], 24)).toBe(0);
    expect(getNearestCrispTocItemIndex([12, 48, 84], -20)).toBe(0);
    expect(getNearestCrispTocItemIndex([12, 48, 84], 140)).toBe(2);
  });
});

describe('buildCrispTocTickMarks', () => {
  test('places a long tick on each item center and two shorts between items', () => {
    const ticks = buildCrispTocTickMarks([100, 220]);
    const longs = ticks.filter((tick) => tick.kind === 'long');
    const shortsBetween = ticks.filter(
      (tick) => tick.kind === 'short' && tick.y > 100 && tick.y < 220,
    );

    expect(longs.map((tick) => tick.y)).toEqual([100, 220]);
    expect(longs.map((tick) => tick.itemIndex)).toEqual([0, 1]);
    expect(shortsBetween.map((tick) => tick.y)).toEqual([140, 180]);
  });

  test('extends the ruler with one short edge tick beyond the first and last items', () => {
    const ticks = buildCrispTocTickMarks([100, 220]);

    expect(ticks[0]).toEqual({ y: 60, kind: 'short' });
    expect(ticks.at(-1)).toEqual({ y: 260, kind: 'short' });
  });

  test('renders a lone item without edge or filler ticks', () => {
    expect(buildCrispTocTickMarks([100])).toEqual([{ y: 100, kind: 'long', itemIndex: 0 }]);
    expect(buildCrispTocTickMarks([])).toEqual([]);
  });
});

describe('stepCrispTocSpring', () => {
  const simulate = (target: number, dt: number, steps: number) => {
    let state = { position: 0, velocity: 0 };
    let peak = 0;
    for (let index = 0; index < steps; index += 1) {
      state = stepCrispTocSpring(state, target, dt);
      peak = Math.max(peak, state.position);
    }
    return { state, peak };
  };

  test('is underdamped: overshoots the target before settling', () => {
    const { peak } = simulate(100, 1 / 120, 240);

    expect(peak).toBeGreaterThan(102);
    expect(peak).toBeLessThan(120);
  });

  test('settles exactly on the target within a second', () => {
    const { state } = simulate(100, 1 / 120, 120);

    expect(state.position).toBe(100);
    expect(state.velocity).toBe(0);
  });

  test('converges at 60fps timing as well', () => {
    const { state } = simulate(100, 1 / 60, 60);

    expect(state.position).toBe(100);
  });
});

describe('getCrispTocScrollTopForBallY', () => {
  const centers = [100, 200, 300];
  const tops = [1000, 3000, 6000];
  const offset = 96;

  test('maps item centers back to their heading scroll positions', () => {
    expect(getCrispTocScrollTopForBallY(100, centers, tops, offset)).toBe(1000 - 96);
    expect(getCrispTocScrollTopForBallY(200, centers, tops, offset)).toBe(3000 - 96);
    expect(getCrispTocScrollTopForBallY(300, centers, tops, offset)).toBe(6000 - 96);
  });

  test('interpolates linearly between adjacent headings', () => {
    expect(getCrispTocScrollTopForBallY(150, centers, tops, offset)).toBe(2000 - 96);
    expect(getCrispTocScrollTopForBallY(250, centers, tops, offset)).toBe(4500 - 96);
  });

  test('clamps drag positions beyond the first and last centers', () => {
    expect(getCrispTocScrollTopForBallY(-50, centers, tops, offset)).toBe(1000 - 96);
    expect(getCrispTocScrollTopForBallY(900, centers, tops, offset)).toBe(6000 - 96);
  });

  test('returns null without measurable headings', () => {
    expect(getCrispTocScrollTopForBallY(100, [], [], offset)).toBeNull();
    expect(getCrispTocScrollTopForBallY(100, centers, [null, null, null], offset)).toBeNull();
  });
});

describe('getCrispTocMorphProgress', () => {
  test('is fully morphed when the ball sits on the tick and idle out of reach', () => {
    expect(getCrispTocMorphProgress(0)).toBe(1);
    expect(getCrispTocMorphProgress(24)).toBe(0);
    expect(getCrispTocMorphProgress(60)).toBe(0);
  });

  test('ramps smoothly and symmetrically as the ball approaches', () => {
    const half = getCrispTocMorphProgress(12);

    expect(half).toBeGreaterThan(0.3);
    expect(half).toBeLessThan(0.7);
    expect(getCrispTocMorphProgress(-12)).toBe(half);
    expect(getCrispTocMorphProgress(6)).toBeGreaterThan(getCrispTocMorphProgress(18));
  });
});

describe('updateCrispTocTickSides', () => {
  test('counts crossings and flips sides as the ball passes ticks', () => {
    const sides = new Map<number, -1 | 1>([
      [10, -1],
      [30, -1],
      [50, -1],
    ]);

    expect(updateCrispTocTickSides(sides, 40)).toBe(2);
    expect(sides.get(10)).toBe(1);
    expect(sides.get(30)).toBe(1);
    expect(sides.get(50)).toBe(-1);
  });

  test('applies hysteresis so hovering on a tick does not retrigger', () => {
    const sides = new Map<number, -1 | 1>([[10, 1]]);

    expect(updateCrispTocTickSides(sides, 10)).toBe(0);
    expect(updateCrispTocTickSides(sides, 9.5)).toBe(0);
    expect(updateCrispTocTickSides(sides, 9)).toBe(1);
  });
});

describe('getNextCrispTickStartTime', () => {
  test('spaces same-frame ticks into an audible ratchet instead of one stacked click', async () => {
    const { getNextCrispTickStartTime } =
      await import('@/shared/components/navigation/crisp-toc-sound');

    expect(getNextCrispTickStartTime(1.0, undefined)).toBe(1.0);
    expect(getNextCrispTickStartTime(1.0, 1.0)).toBeCloseTo(1.015, 5);
    expect(getNextCrispTickStartTime(1.0, 1.01)).toBeCloseTo(1.025, 5);
    expect(getNextCrispTickStartTime(2.0, 1.0)).toBe(2.0);
  });
});

describe('crisp tick sound source', () => {
  test('plays the sampled tick from the reference recording, not a synthesized sweep', () => {
    const source = readFileSync(new URL('./crisp-toc-sound.ts', import.meta.url), 'utf8');

    expect(source).toContain('CRISP_TICK_SAMPLE_BASE64');
    expect(source).not.toContain('createOscillator');
  });
});

describe('CrispToc ball markup', () => {
  test('renders only the solid draggable dot without an outer ring element', () => {
    const source = readFileSync(new URL('./CrispToc.client.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain('crisp-toc-origin-ring');
  });

  test('does not modulate tick opacity or hide ticks near the ball', () => {
    const source = readFileSync(new URL('./CrispToc.client.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain('shouldHideCrispTocTickNearBall');
    expect(source).not.toContain('opacity:');
  });

  test('keeps labels on a single line instead of clamping to two', () => {
    const source = readFileSync(new URL('./CrispToc.client.tsx', import.meta.url), 'utf8');

    expect(source).not.toContain('line-clamp-2');
  });

  test('renders a connector line element for the active item', () => {
    const source = readFileSync(new URL('./CrispToc.client.tsx', import.meta.url), 'utf8');

    expect(source).toContain('crisp-toc-line');
  });

  test('drives every tick color from ball proximity so shorts darken too', () => {
    const source = readFileSync(new URL('./CrispToc.client.tsx', import.meta.url), 'utf8');

    expect(source).toContain('--crisp-tick-heat');
  });
});
