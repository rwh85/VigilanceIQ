import {
  initialize,
  requestPermission,
  readRecords,
  insertRecords,
} from 'react-native-health-connect';
import { SleepSession } from '../../models/types';
import { HealthService } from './health-service';

class HealthConnectServiceImpl implements HealthService {
  private initialized = false;

  isAvailable(): boolean {
    return true; // Health Connect available on Android 14+, check at runtime
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await initialize();
        this.initialized = true;
      }

      const granted = await requestPermission([
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'write', recordType: 'SleepSession' },
      ]);

      return granted.length > 0;
    } catch {
      return false;
    }
  }

  async writeSleepSession(session: SleepSession): Promise<void> {
    if (!this.initialized) {
      await initialize();
      this.initialized = true;
    }
    await insertRecords([
      {
        recordType: 'SleepSession',
        startTime: session.startDate.toISOString(),
        endTime: session.endDate.toISOString(),
        stages: [],
      },
    ]);
  }

  async getSleepSessions(startDate: Date, endDate: Date): Promise<SleepSession[]> {
    try {
      if (!this.initialized) {
        await initialize();
        this.initialized = true;
      }

      const result = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      });

      return result.records.map((record: any) => ({
        id: record.metadata?.id || `hc-${record.startTime}-${record.endTime}`,
        startDate: new Date(record.startTime),
        endDate: new Date(record.endTime),
        source: 'healthconnect' as const,
      }));
    } catch {
      return [];
    }
  }
}

export const healthService: HealthService = new HealthConnectServiceImpl();
export default healthService;
