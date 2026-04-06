import { SleepSession } from '../../models/types';

export interface HealthService {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  getSleepSessions(startDate: Date, endDate: Date): Promise<SleepSession[]>;
  writeSleepSession(session: SleepSession): Promise<void>;
}

// Platform-specific implementations are loaded via .ios.ts / .android.ts
// Metro resolves the correct file at bundle time; this stub satisfies TypeScript.
const healthService: HealthService = {
  isAvailable: () => false,
  requestPermissions: () => Promise.resolve(false),
  getSleepSessions: () => Promise.resolve([]),
  writeSleepSession: () => Promise.resolve(),
};

export { healthService };
export default healthService;
