import { getDatabase } from '../db/migrations';
import type {
  FeatureSelectionRecord,
  FeatureSelectionRow,
  StoredWorkoutPlan,
  WorkoutPlanRow,
} from '../types/database';
import type { WorkoutPlan, WorkoutRequest } from '../types/workout';

const DEMO_USER_ID = 'demo-user';

// Workout Plans
export async function getWorkoutPlans(): Promise<StoredWorkoutPlan[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE userId = ? ORDER BY createdAt DESC',
    [DEMO_USER_ID]
  );

  return rows.map((row) => ({
    ...row,
    requestPayload: JSON.parse(row.requestPayload) as WorkoutRequest,
    responsePayload: row.responsePayload ? (JSON.parse(row.responsePayload) as WorkoutPlan) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function getWorkoutPlanById(id: string): Promise<StoredWorkoutPlan | null> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE id = ? AND userId = ?',
    [id, DEMO_USER_ID]
  );

  if (!row) {
    return null;
  }

  return {
    ...row,
    requestPayload: JSON.parse(row.requestPayload) as WorkoutRequest,
    responsePayload: row.responsePayload ? (JSON.parse(row.responsePayload) as WorkoutPlan) : null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export async function saveWorkoutPlan(
  request: WorkoutRequest,
  response?: WorkoutPlan,
  artifactPath?: string
): Promise<StoredWorkoutPlan> {
  const db = await getDatabase();

  const id = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO workout_plans (id, userId, programName, requestPayload, responsePayload, artifactPath, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      DEMO_USER_ID,
      request.programName,
      JSON.stringify(request),
      response ? JSON.stringify(response) : null,
      artifactPath || null,
      now,
      now,
    ]
  );

  return {
    id,
    userId: DEMO_USER_ID,
    programName: request.programName,
    requestPayload: request,
    responsePayload: response || null,
    artifactPath: artifactPath || null,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  const db = await getDatabase();

  await db.runAsync('DELETE FROM workout_plans WHERE id = ? AND userId = ?', [id, DEMO_USER_ID]);
}

// Feature Selections
export async function getFeatureSelections(): Promise<FeatureSelectionRecord> {
  const db = await getDatabase();

  const row = await db.getFirstAsync<FeatureSelectionRow>(
    'SELECT * FROM feature_selections WHERE userId = ?',
    [DEMO_USER_ID]
  );

  if (!row) {
    // Return default values if not found
    return {
      id: 'default',
      userId: DEMO_USER_ID,
      workoutProgrammer: true,
      journaling: false,
      calendar: false,
      updatedAt: new Date(),
    };
  }

  return {
    ...row,
    workoutProgrammer: !!row.workoutProgrammer,
    journaling: !!row.journaling,
    calendar: !!row.calendar,
    updatedAt: new Date(row.updatedAt),
  };
}

export async function updateFeatureSelections(
  updates: Partial<{ workoutProgrammer: number; journaling: number; calendar: number }>
): Promise<void> {
  const db = await getDatabase();

  const updateFields: string[] = [];
  const values: (number | string)[] = [];

  if (updates.workoutProgrammer !== undefined) {
    updateFields.push('workoutProgrammer = ?');
    values.push(updates.workoutProgrammer);
  }

  if (updates.journaling !== undefined) {
    updateFields.push('journaling = ?');
    values.push(updates.journaling);
  }

  if (updates.calendar !== undefined) {
    updateFields.push('calendar = ?');
    values.push(updates.calendar);
  }

  if (updateFields.length === 0) {
    return;
  }

  updateFields.push('updatedAt = ?');
  values.push(Date.now());

  values.push(DEMO_USER_ID);

  await db.runAsync(
    `UPDATE feature_selections SET ${updateFields.join(', ')} WHERE userId = ?`,
    values
  );
}
