import { sqliteTable, text, real, integer, blob } from 'drizzle-orm/sqlite-core';
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

// --- Schema ---

export const sleepSessions = sqliteTable('sleep_sessions', {
  id: text('id').primaryKey(),
  startDate: integer('start_date', { mode: 'timestamp_ms' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp_ms' }).notNull(),
  source: text('source').notNull().default('manual'),
  quality: text('quality'),
});

export const pvtResults = sqliteTable('pvt_results', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull(),
  reactionTimes: text('reaction_times').notNull(), // JSON array
  durationSeconds: integer('duration_seconds').notNull().default(60),
  isBaseline: integer('is_baseline', { mode: 'boolean' }).notNull().default(false),
  sleepHoursPriorNight: real('sleep_hours_prior_night'),
  hoursAwake: real('hours_awake'),
});

export const caffeineIntakes = sqliteTable('caffeine_intakes', {
  id: text('id').primaryKey(),
  timeHour: real('time_hour').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull(),
  doseMg: real('dose_mg').notNull(),
  source: text('source').notNull().default('coffee'),
  note: text('note'),
});

export const caffeinePresets = sqliteTable('caffeine_presets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  doseMg: real('dose_mg').notNull(),
  iconName: text('icon_name').notNull().default('cafe-outline'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// --- Database Instance ---

const expo = SQLite.openDatabaseSync('vigilanceiq.db');

export const db = drizzle(expo);

// --- Initialize Tables ---

export async function initDatabase(): Promise<void> {
  await expo.execAsync(`
    CREATE TABLE IF NOT EXISTS sleep_sessions (
      id TEXT PRIMARY KEY,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      quality TEXT
    );
    CREATE TABLE IF NOT EXISTS pvt_results (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      reaction_times TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 60,
      is_baseline INTEGER NOT NULL DEFAULT 0,
      sleep_hours_prior_night REAL,
      hours_awake REAL
    );
    CREATE TABLE IF NOT EXISTS caffeine_intakes (
      id TEXT PRIMARY KEY,
      time_hour REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      dose_mg REAL NOT NULL,
      source TEXT NOT NULL DEFAULT 'coffee',
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS caffeine_presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dose_mg REAL NOT NULL,
      icon_name TEXT NOT NULL DEFAULT 'cafe-outline',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}
