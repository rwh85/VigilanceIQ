import { SleepWakeSchedule } from '../../src/models/sleep-wake-schedule';
import { SleepSession } from '../../src/models/types';

describe('SleepWakeSchedule', () => {
  describe('isAwake', () => {
    test('returns true during wake period', () => {
      const schedule = new SleepWakeSchedule([[6, 22]], [[22, 30]]);
      expect(schedule.isAwake(12)).toBe(true);
    });
    test('returns false during sleep period', () => {
      const schedule = new SleepWakeSchedule([[6, 22]], [[22, 30]]);
      expect(schedule.isAwake(3)).toBe(false);
    });
  });
  describe('hoursAwakeSince', () => {
    test('counts only wake hours', () => {
      const schedule = new SleepWakeSchedule([[6, 22]], [[0, 6]]);
      expect(schedule.hoursAwakeSince(10, 0)).toBeCloseTo(4, 1);
    });
    test('returns 0 when reference is in the future', () => {
      const schedule = new SleepWakeSchedule([[0, 24]], []);
      expect(schedule.hoursAwakeSince(5, 10)).toBe(0);
    });
  });
  describe('fromSleepSessions', () => {
    test('creates schedule from sleep sessions', () => {
      const referenceDate = new Date('2026-04-02T12:00:00');
      const sessions: SleepSession[] = [{
        id: '1', startDate: new Date('2026-04-01T23:00:00'), endDate: new Date('2026-04-02T07:00:00'), source: 'manual',
      }];
      const schedule = SleepWakeSchedule.fromSleepSessions(sessions, referenceDate);
      expect(schedule.sleepTimes.length).toBe(1);
      expect(schedule.wakeTimes.length).toBeGreaterThanOrEqual(1);
    });
    test('assumes always awake with no sleep data', () => {
      const referenceDate = new Date('2026-04-02T12:00:00');
      const schedule = SleepWakeSchedule.fromSleepSessions([], referenceDate);
      expect(schedule.wakeTimes.length).toBe(1);
      expect(schedule.isAwake(5)).toBe(true);
    });
  });
});
