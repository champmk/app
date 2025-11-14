import type { WorkoutPlan, WorkoutRequest } from './workout';

export type WorkoutPlanRow = {
  id: string;
  userId: string;
  programName: string;
  requestPayload: string;
  responsePayload: string | null;
  artifactPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type StoredWorkoutPlan = {
  id: string;
  userId: string;
  programName: string;
  requestPayload: WorkoutRequest;
  responsePayload: WorkoutPlan | null;
  artifactPath: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FeatureSelectionRow = {
  id: string;
  userId: string;
  workoutProgrammer: number | null;
  journaling: number | null;
  calendar: number | null;
  updatedAt: Date;
};

export type FeatureSelectionRecord = {
  id: string;
  userId: string;
  workoutProgrammer: boolean;
  journaling: boolean;
  calendar: boolean;
  updatedAt: Date;
};
