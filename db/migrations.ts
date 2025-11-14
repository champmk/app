import * as SQLite from 'expo-sqlite';

const DB_NAME = 'neuraladapt.db';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  const database = getDatabase();

  // Create workout_plans table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL DEFAULT 'default',
      program_name TEXT NOT NULL,
      request_payload TEXT NOT NULL,
      response_payload TEXT,
      artifact_path TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Create feature_selections table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS feature_selections (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL DEFAULT 'default',
      workout_programmer INTEGER DEFAULT 1,
      journaling INTEGER DEFAULT 0,
      calendar INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Initialize default feature selections if not exists
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM feature_selections WHERE user_id = ?',
    ['default']
  );

  if (result && result.count === 0) {
    await database.runAsync(
      `INSERT INTO feature_selections (id, user_id, workout_programmer, journaling, calendar, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['default', 'default', 1, 0, 0, Date.now()]
    );
  }

  console.log('Database initialized successfully');
};
