import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('neuraladapt.db');
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Create workout plans table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      programName TEXT NOT NULL,
      requestPayload TEXT NOT NULL,
      responsePayload TEXT,
      artifactPath TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Create feature selections table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS feature_selections (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL UNIQUE,
      workoutProgrammer INTEGER DEFAULT 0,
      journaling INTEGER DEFAULT 0,
      calendar INTEGER DEFAULT 0,
      updatedAt INTEGER NOT NULL
    );
  `);

  // Initialize default feature selections for demo user
  await database.execAsync(`
    INSERT OR IGNORE INTO feature_selections (id, userId, workoutProgrammer, journaling, calendar, updatedAt)
    VALUES ('default', 'demo-user', 1, 0, 0, ${Date.now()});
  `);
}
