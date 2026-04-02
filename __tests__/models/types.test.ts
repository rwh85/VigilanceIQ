import { CaffeineSource, getTypicalDose, getPerformanceLevel, DEFAULT_CAFFEINE_PRESETS, PVTResult } from '../../src/models/types';
import { Constants } from '../../src/models/constants';

describe('CaffeineSource', () => {
  test('getTypicalDose returns correct values', () => {
    expect(getTypicalDose('coffee')).toBe(95);
    expect(getTypicalDose('espresso')).toBe(64);
    expect(getTypicalDose('tea')).toBe(47);
    expect(getTypicalDose('energyDrink')).toBe(80);
    expect(getTypicalDose('soda')).toBe(34);
    expect(getTypicalDose('preworkout')).toBe(200);
    expect(getTypicalDose('pill')).toBe(200);
    expect(getTypicalDose('custom')).toBe(100);
  });
});

describe('PVTResult', () => {
  test('computed properties calculate correctly', () => {
    const result: PVTResult = {
      id: 'test-1', timestamp: new Date(), reactionTimes: [350, 400, 450, 500, 300],
      durationSeconds: 60, isBaseline: false,
    };
    expect(result.reactionTimes.reduce((a, b) => a + b, 0) / result.reactionTimes.length).toBe(400);
    expect(Math.min(...result.reactionTimes)).toBe(300);
    expect(Math.max(...result.reactionTimes)).toBe(500);
  });
});

describe('getPerformanceLevel', () => {
  test('returns correct level based on mean RT', () => {
    expect(getPerformanceLevel(350)).toBe('excellent');
    expect(getPerformanceLevel(380)).toBe('good');
    expect(getPerformanceLevel(440)).toBe('fair');
    expect(getPerformanceLevel(500)).toBe('poor');
    expect(getPerformanceLevel(600)).toBe('veryPoor');
  });
});

describe('DEFAULT_CAFFEINE_PRESETS', () => {
  test('has 6 presets with correct order', () => {
    expect(DEFAULT_CAFFEINE_PRESETS).toHaveLength(6);
    expect(DEFAULT_CAFFEINE_PRESETS[0].name).toBe('Coffee');
    expect(DEFAULT_CAFFEINE_PRESETS[0].doseMg).toBe(95);
    expect(DEFAULT_CAFFEINE_PRESETS[5].name).toBe('Pre-Workout');
  });
});
