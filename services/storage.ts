import { getDatabase } from '../db/migrations';
import type {
  StoredWorkoutPlan,
  WorkoutPlanRow,
  FeatureSelectionRow,
  FeatureSelectionRecord,
} from '../types/database';
import type { WorkoutPlan, WorkoutRequest } from '../types/workout';

const DEFAULT_USER_ID = 'default';

// Helper function to convert row to StoredWorkoutPlan
const rowToStoredPlan = (row: WorkoutPlanRow): StoredWorkoutPlan => {
  return {
    id: row.id,
    userId: row.userId,
    programName: row.programName,
    requestPayload: JSON.parse(row.requestPayload) as WorkoutRequest,
    responsePayload: row.responsePayload ? (JSON.parse(row.responsePayload) as WorkoutPlan) : null,
    artifactPath: row.artifactPath,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
};

// Helper function to convert feature row to record
const rowToFeatureRecord = (row: FeatureSelectionRow): FeatureSelectionRecord => {
  return {
    id: row.id,
    userId: row.userId,
    workoutProgrammer: !!row.workoutProgrammer,
    journaling: !!row.journaling,
    calendar: !!row.calendar,
    updatedAt: new Date(row.updatedAt),
  };
};

export const getWorkoutPlans = async (): Promise<StoredWorkoutPlan[]> => {
  const db = getDatabase();
  const rows = await db.getAllAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC',
    [DEFAULT_USER_ID]
  );
  return rows.map(rowToStoredPlan);
};

export const getWorkoutPlanById = async (planId: string): Promise<StoredWorkoutPlan | null> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<WorkoutPlanRow>(
    'SELECT * FROM workout_plans WHERE id = ? AND user_id = ?',
    [planId, DEFAULT_USER_ID]
  );
  return row ? rowToStoredPlan(row) : null;
};

export const createWorkoutPlan = async (
  plan: Omit<StoredWorkoutPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<StoredWorkoutPlan> => {
  const db = getDatabase();
  const id = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO workout_plans (id, user_id, program_name, request_payload, response_payload, artifact_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      DEFAULT_USER_ID,
      plan.programName,
      JSON.stringify(plan.requestPayload),
      plan.responsePayload ? JSON.stringify(plan.responsePayload) : null,
      plan.artifactPath,
      now,
      now,
    ]
  );

  const created = await getWorkoutPlanById(id);
  if (!created) {
    throw new Error('Failed to create workout plan');
  }
  return created;
};

export const deleteWorkoutPlan = async (planId: string): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM workout_plans WHERE id = ? AND user_id = ?', [
    planId,
    DEFAULT_USER_ID,
  ]);
};

export const getFeatureSelections = async (): Promise<FeatureSelectionRecord> => {
  const db = getDatabase();
  const row = await db.getFirstAsync<FeatureSelectionRow>(
    'SELECT * FROM feature_selections WHERE user_id = ?',
    [DEFAULT_USER_ID]
  );

  if (!row) {
    // Return default values if not found
    return {
      id: 'default',
      userId: DEFAULT_USER_ID,
      workoutProgrammer: true,
      journaling: false,
      calendar: false,
      updatedAt: new Date(),
    };
  }

  return rowToFeatureRecord(row);
};

export const updateFeatureSelections = async (
  updates: Partial<Pick<FeatureSelectionRecord, 'workoutProgrammer' | 'journaling' | 'calendar'>>
): Promise<void> => {
  const db = getDatabase();
  const now = Date.now();

  // Build update query dynamically based on provided fields
  const fields: string[] = [];
  const values: (number | string)[] = [];

  if (updates.workoutProgrammer !== undefined) {
    fields.push('workout_programmer = ?');
    values.push(updates.workoutProgrammer ? 1 : 0);
  }
  if (updates.journaling !== undefined) {
    fields.push('journaling = ?');
    values.push(updates.journaling ? 1 : 0);
  }
  if (updates.calendar !== undefined) {
    fields.push('calendar = ?');
    values.push(updates.calendar ? 1 : 0);
  }

  if (fields.length === 0) {
    return; // Nothing to update
  }

  fields.push('updated_at = ?');
  values.push(now);

  values.push(DEFAULT_USER_ID);

  await db.runAsync(
    `UPDATE feature_selections SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
};
