import { AlertnessModel } from '../../src/models/alertness-model';
import { GROUP_AVERAGE_PARAMS, CaffeineIntake } from '../../src/models/types';

describe('AlertnessModel', () => {
  const model = new AlertnessModel(GROUP_AVERAGE_PARAMS);

  describe('homeostaticProcess', () => {
    test('returns xi when hoursAwake is 0', () => {
      expect(model.homeostaticProcess(0)).toBeCloseTo(0.0, 5);
    });

    test('increases with hours awake', () => {
      const s4 = model.homeostaticProcess(4);
      const s8 = model.homeostaticProcess(8);
      const s16 = model.homeostaticProcess(16);
      expect(s4).toBeGreaterThan(0);
      expect(s8).toBeGreaterThan(s4);
      expect(s16).toBeGreaterThan(s8);
    });

    test('saturates at 1.0', () => {
      const s100 = model.homeostaticProcess(100);
      expect(s100).toBeLessThanOrEqual(1.0);
    });
  });

  describe('circadianProcess', () => {
    test('produces oscillation over 24 hours', () => {
      const values = Array.from({ length: 24 }, (_, h) => model.circadianProcess(h));
      const max = Math.max(...values);
      const min = Math.min(...values);
      expect(max).toBeGreaterThan(0);
      expect(min).toBeLessThan(0);
    });

    test('trough is near early morning (3-6 AM)', () => {
      const values = Array.from({ length: 24 }, (_, h) => ({ hour: h, value: model.circadianProcess(h) }));
      const worst = values.reduce((a, b) => (a.value > b.value ? a : b));
      // Highest circadian value = worst alertness contribution
      expect(worst.hour).toBeGreaterThanOrEqual(2);
      expect(worst.hour).toBeLessThanOrEqual(7);
    });
  });

  describe('caffeineEffect', () => {
    test('returns 0 with no caffeine history', () => {
      expect(model.caffeineEffect(10, [])).toBe(0);
    });

    test('returns 0 at time of dose (not yet absorbed)', () => {
      const intake: CaffeineIntake = {
        id: '1', timeHour: 10, timestamp: new Date(), doseMg: 200, source: 'coffee',
      };
      expect(model.caffeineEffect(10, [intake])).toBe(0);
    });

    test('peaks then decays after dose', () => {
      const intake: CaffeineIntake = {
        id: '1', timeHour: 0, timestamp: new Date(), doseMg: 200, source: 'coffee',
      };
      // With caffeineAbsorptionRate=4.0, PK peak is at ~0.9h
      const at0_5h = model.caffeineEffect(0.5, [intake]);
      const at1h = model.caffeineEffect(1, [intake]);
      const at12h = model.caffeineEffect(12, [intake]);
      expect(at0_5h).toBeGreaterThan(0);
      expect(at1h).toBeGreaterThan(at0_5h); // Still rising toward peak
      expect(at12h).toBeLessThan(at1h);     // Decaying after peak
    });
  });

  describe('alertnessImpairment', () => {
    test('returns baseline kappa when well-rested at peak time', () => {
      // At 0 hours awake, homeostatic = 0, only circadian affects result
      const impairment = model.alertnessImpairment(14, 0, []);
      // Should be near kappa (360) + circadian contribution at 2PM
      expect(impairment).toBeGreaterThanOrEqual(GROUP_AVERAGE_PARAMS.baselineRtMs);
    });

    test('impairment increases with hours awake', () => {
      const at4h = model.alertnessImpairment(12, 4, []);
      const at16h = model.alertnessImpairment(12, 16, []);
      expect(at16h).toBeGreaterThan(at4h);
    });

    test('caffeine reduces impairment', () => {
      const intake: CaffeineIntake = {
        id: '1', timeHour: 8, timestamp: new Date(), doseMg: 200, source: 'coffee',
      };
      const without = model.alertnessImpairment(12, 8, []);
      const withCaffeine = model.alertnessImpairment(12, 8, [intake]);
      expect(withCaffeine).toBeLessThan(without);
    });
  });

  describe('bacEquivalence', () => {
    test('returns 0 at baseline', () => {
      expect(model.bacEquivalence(360)).toBe(0);
    });

    test('returns ~0.05 at 50ms above baseline', () => {
      expect(model.bacEquivalence(410)).toBeCloseTo(0.05, 2);
    });

    test('never returns negative', () => {
      expect(model.bacEquivalence(300)).toBe(0);
    });
  });

  describe('predictTimeseries', () => {
    test('generates correct number of time points', () => {
      const schedule = { wakeTimes: [[0, 24]] as [number, number][], sleepTimes: [] as [number, number][] };
      const prediction = model.predictTimeseries(schedule, 12, [], 0.5, 8);
      // 12 hours / 0.5 step = 24 intervals + 1 starting point = 25
      expect(prediction.times.length).toBe(25);
      expect(prediction.impairments.length).toBe(25);
    });
  });
});
