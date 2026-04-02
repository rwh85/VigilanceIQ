import { SleepSession } from './types';

export class SleepWakeSchedule {
  wakeTimes: [number, number][];
  sleepTimes: [number, number][];

  constructor(wakeTimes: [number, number][] = [], sleepTimes: [number, number][] = []) {
    this.wakeTimes = wakeTimes;
    this.sleepTimes = sleepTimes;
  }

  isAwake(timeHour: number): boolean {
    for (const [wakeStart, wakeEnd] of this.wakeTimes) {
      if (wakeStart <= timeHour && timeHour <= wakeEnd) return true;
    }
    return false;
  }

  hoursAwakeSince(currentTime: number, referenceTime: number): number {
    if (referenceTime > currentTime) return 0;
    let totalAwake = 0;
    let t = referenceTime;
    while (t < currentTime) {
      let nextBoundary = currentTime;
      for (const [wakeStart, wakeEnd] of this.wakeTimes) {
        if (t < wakeStart && wakeStart <= currentTime) nextBoundary = Math.min(nextBoundary, wakeStart);
        if (t < wakeEnd && wakeEnd <= currentTime) nextBoundary = Math.min(nextBoundary, wakeEnd);
      }
      for (const [sleepStart, sleepEnd] of this.sleepTimes) {
        if (t < sleepStart && sleepStart <= currentTime) nextBoundary = Math.min(nextBoundary, sleepStart);
        if (t < sleepEnd && sleepEnd <= currentTime) nextBoundary = Math.min(nextBoundary, sleepEnd);
      }
      if (nextBoundary === currentTime) {
        if (this.isAwake(t)) totalAwake += currentTime - t;
        break;
      } else {
        if (this.isAwake(t)) totalAwake += nextBoundary - t;
        t = nextBoundary;
      }
    }
    return totalAwake;
  }

  static fromSleepSessions(sessions: SleepSession[], referenceDate: Date): SleepWakeSchedule {
    const sleepPeriods: [number, number][] = [];
    const wakePeriods: [number, number][] = [];
    const sorted = [...sessions].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    for (const session of sorted) {
      const startHours = (session.startDate.getTime() - referenceDate.getTime()) / 3600000;
      const endHours = (session.endDate.getTime() - referenceDate.getTime()) / 3600000;
      sleepPeriods.push([startHours, endHours]);
    }
    if (sleepPeriods.length > 0) {
      for (let i = 0; i < sleepPeriods.length - 1; i++) {
        const wakeStart = sleepPeriods[i][1];
        const wakeEnd = sleepPeriods[i + 1][0];
        if (wakeStart < wakeEnd) wakePeriods.push([wakeStart, wakeEnd]);
      }
      const lastSleepEnd = sleepPeriods[sleepPeriods.length - 1][1];
      wakePeriods.push([lastSleepEnd, 168]);
    } else {
      wakePeriods.push([-24, 168]);
    }
    return new SleepWakeSchedule(wakePeriods, sleepPeriods);
  }
}
