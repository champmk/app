import type { WorkoutPlan } from './workout';

export type GenerateWorkoutResponse = {
  success: boolean;
  plan: WorkoutPlan;
  artifactPath?: string;
};
