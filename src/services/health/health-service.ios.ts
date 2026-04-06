import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import { SleepSession } from '../../models/types';
import { HealthService } from './health-service';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.SleepAnalysis],
    write: [],
  },
};

class HealthKitServiceImpl implements HealthService {
  isAvailable(): boolean {
    // react-native-health isAvailable is async; assume available on iOS
    return true;
  }

  requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
        resolve(!err);
      });
    });
  }

  writeSleepSession(_session: SleepSession): Promise<void> {
    // react-native-health does not expose a typed saveSleep API in this version.
    // Sleep write-back to HealthKit is deferred to a native module upgrade.
    return Promise.resolve();
  }

  getSleepSessions(startDate: Date, endDate: Date): Promise<SleepSession[]> {
    return new Promise((resolve, reject) => {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      AppleHealthKit.getSleepSamples(options, (err: string | null, results: HealthValue[]) => {
        if (err) {
          reject(new Error(err));
          return;
        }

        const sessions: SleepSession[] = results.map((sample: any) => ({
          id: sample.id || `hk-${sample.startDate}-${sample.endDate}`,
          startDate: new Date(sample.startDate),
          endDate: new Date(sample.endDate),
          source: 'healthkit' as const,
        }));

        // Deduplicate overlapping sessions
        const deduped = deduplicateSessions(sessions);
        resolve(deduped);
      });
    });
  }
}

function deduplicateSessions(sessions: SleepSession[]): SleepSession[] {
  const sorted = [...sessions].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const result: SleepSession[] = [];

  for (const session of sorted) {
    const last = result[result.length - 1];
    if (last && Math.abs(session.startDate.getTime() - last.startDate.getTime()) < 300000) {
      // Within 5 minutes — merge by keeping longer duration
      if (session.endDate.getTime() - session.startDate.getTime() >
          last.endDate.getTime() - last.startDate.getTime()) {
        result[result.length - 1] = session;
      }
    } else {
      result.push(session);
    }
  }

  return result;
}

export const healthService: HealthService = new HealthKitServiceImpl();
export default healthService;
