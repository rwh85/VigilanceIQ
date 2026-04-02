import { eq, desc, gte } from 'drizzle-orm';
import { db, sleepSessions, pvtResults, caffeineIntakes, caffeinePresets } from './database';
import {
  SleepSession,
  PVTResult,
  CaffeineIntake,
  CaffeinePreset,
  SleepSource,
  SleepQuality,
  CaffeineSource,
} from '../models/types';

// --- Sleep Sessions ---

export async function saveSleepSession(session: SleepSession): Promise<void> {
  await db.insert(sleepSessions).values({
    id: session.id,
    startDate: session.startDate,
    endDate: session.endDate,
    source: session.source,
    quality: session.quality ?? null,
  });
}

export async function getSleepSessions(since?: Date): Promise<SleepSession[]> {
  const query = since
    ? db.select().from(sleepSessions).where(gte(sleepSessions.endDate, since)).orderBy(desc(sleepSessions.startDate))
    : db.select().from(sleepSessions).orderBy(desc(sleepSessions.startDate));

  const rows = await query;
  return rows.map((row) => ({
    id: row.id,
    startDate: new Date(row.startDate),
    endDate: new Date(row.endDate),
    source: row.source as SleepSource,
    quality: row.quality as SleepQuality | undefined,
  }));
}

export async function deleteSleepSession(id: string): Promise<void> {
  await db.delete(sleepSessions).where(eq(sleepSessions.id, id));
}

// --- PVT Results ---

export async function savePVTResult(result: PVTResult): Promise<void> {
  await db.insert(pvtResults).values({
    id: result.id,
    timestamp: result.timestamp,
    reactionTimes: JSON.stringify(result.reactionTimes),
    durationSeconds: result.durationSeconds,
    isBaseline: result.isBaseline,
    sleepHoursPriorNight: result.sleepHoursPriorNight ?? null,
    hoursAwake: result.hoursAwake ?? null,
  });
}

export async function getPVTResults(): Promise<PVTResult[]> {
  const rows = await db.select().from(pvtResults).orderBy(desc(pvtResults.timestamp));
  return rows.map((row) => ({
    id: row.id,
    timestamp: new Date(row.timestamp),
    reactionTimes: JSON.parse(row.reactionTimes) as number[],
    durationSeconds: row.durationSeconds,
    isBaseline: row.isBaseline,
    sleepHoursPriorNight: row.sleepHoursPriorNight ?? undefined,
    hoursAwake: row.hoursAwake ?? undefined,
  }));
}

export async function deletePVTResult(id: string): Promise<void> {
  await db.delete(pvtResults).where(eq(pvtResults.id, id));
}

// --- Caffeine Intakes ---

export async function saveCaffeineIntake(intake: CaffeineIntake): Promise<void> {
  await db.insert(caffeineIntakes).values({
    id: intake.id,
    timeHour: intake.timeHour,
    timestamp: intake.timestamp,
    doseMg: intake.doseMg,
    source: intake.source,
    note: intake.note ?? null,
  });
}

export async function getCaffeineIntakes(since?: Date): Promise<CaffeineIntake[]> {
  const query = since
    ? db.select().from(caffeineIntakes).where(gte(caffeineIntakes.timestamp, since)).orderBy(desc(caffeineIntakes.timestamp))
    : db.select().from(caffeineIntakes).orderBy(desc(caffeineIntakes.timestamp));

  const rows = await query;
  return rows.map((row) => ({
    id: row.id,
    timeHour: row.timeHour,
    timestamp: new Date(row.timestamp),
    doseMg: row.doseMg,
    source: row.source as CaffeineSource,
    note: row.note ?? undefined,
  }));
}

export async function deleteCaffeineIntake(id: string): Promise<void> {
  await db.delete(caffeineIntakes).where(eq(caffeineIntakes.id, id));
}

// --- Caffeine Presets ---

export async function saveCaffeinePreset(preset: CaffeinePreset): Promise<void> {
  await db.insert(caffeinePresets).values({
    id: preset.id,
    name: preset.name,
    doseMg: preset.doseMg,
    iconName: preset.iconName,
    sortOrder: preset.sortOrder,
  });
}

export async function getCaffeinePresets(): Promise<CaffeinePreset[]> {
  const rows = await db.select().from(caffeinePresets).orderBy(caffeinePresets.sortOrder);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    doseMg: row.doseMg,
    iconName: row.iconName,
    sortOrder: row.sortOrder,
  }));
}

export async function deleteCaffeinePreset(id: string): Promise<void> {
  await db.delete(caffeinePresets).where(eq(caffeinePresets.id, id));
}

export async function deleteAllData(): Promise<void> {
  await db.delete(sleepSessions);
  await db.delete(pvtResults);
  await db.delete(caffeineIntakes);
  await db.delete(caffeinePresets);
}
