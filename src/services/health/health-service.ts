import { SleepSession } from '../../models/types';

export interface HealthService {
  isAvailable(): boolean;
  requestPermissions(): Promise<boolean>;
  getSleepSessions(startDate: Date, endDate: Date): Promise<SleepSession[]>;
}

// Platform-specific implementations are loaded via .ios.ts / .android.ts
// Re-export the platform-specific default from here is handled by
// Metro bundler's platform extension resolution.
