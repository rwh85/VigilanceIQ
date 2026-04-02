import { PersonalizationService } from '../../src/services/personalization-service';
import { PVTResult, GROUP_AVERAGE_PARAMS } from '../../src/models/types';

function makePVTResult(overrides: Partial<PVTResult> & { meanRT: number }): PVTResult {
  const { meanRT, ...rest } = overrides;
  const count = 30;
  const variance = 40;
  const reactionTimes = Array.from({ length: count }, () =>
    Math.max(150, meanRT + (Math.random() * 2 - 1) * variance)
  );
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: new Date(),
    reactionTimes,
    durationSeconds: 60,
    isBaseline: false,
    ...rest,
  };
}

describe('PersonalizationService', () => {
  test('progress is 0 with no results', () => {
    const service = new PersonalizationService();
    expect(service.getProgress([])).toBe(0);
  });
  test('progress scales linearly up to threshold', () => {
    const service = new PersonalizationService();
    const results = Array.from({ length: 5 }, () => makePVTResult({ meanRT: 370 }));
    expect(service.getProgress(results)).toBeCloseTo(0.5, 1);
  });
  test('progress is 1.0 at threshold', () => {
    const service = new PersonalizationService();
    const results = Array.from({ length: 10 }, () => makePVTResult({ meanRT: 370 }));
    expect(service.getProgress(results)).toBe(1.0);
  });
  test('updateKappa returns mean of well-rested tests', () => {
    const service = new PersonalizationService();
    const results = [
      makePVTResult({ meanRT: 350, isBaseline: true, sleepHoursPriorNight: 8, hoursAwake: 2 }),
      makePVTResult({ meanRT: 370, isBaseline: true, sleepHoursPriorNight: 8, hoursAwake: 2 }),
    ];
    const kappa = service.updateKappa(results);
    expect(kappa).toBeGreaterThan(340);
    expect(kappa).toBeLessThan(380);
  });
  test('updateKappa returns group average with no well-rested tests', () => {
    const service = new PersonalizationService();
    const results = [makePVTResult({ meanRT: 500, isBaseline: false })];
    const kappa = service.updateKappa(results);
    expect(kappa).toBe(GROUP_AVERAGE_PARAMS.kappa);
  });
  test('updateGamma clamps to valid range', () => {
    const service = new PersonalizationService();
    const gamma = service.updateGamma([]);
    expect(gamma).toBe(GROUP_AVERAGE_PARAMS.gamma);
  });
});
