import { z } from 'zod';

export const workoutGenerationSchema = z.object({
  programName: z.string(),
  trainingFocus: z.enum(['Powerlifting', 'Bodybuilding', 'General Fitness']).default('General Fitness'),
  programType: z.enum(['Microcycle', 'Mesocycle', 'Macrocycle', 'Block']),
  cycleLengthWeeks: z.number().int().positive(),
  sessionLengthMinutes: z.number().int().positive(),
  experienceLevel: z.string(),
  startDate: z.string(),
  goals: z.string(),
  injuries: z.string().optional(),
  equipment: z.string(),
  trainingFrequency: z.number().int().positive(),
  powerliftingStats: z
    .object({
      squatMax: z.string().optional(),
      benchMax: z.string().optional(),
      deadliftMax: z.string().optional(),
    })
    .optional(),
});

export type WorkoutRequest = z.infer<typeof workoutGenerationSchema>;

export const sessionLiftSchema = z.object({
  name: z.string(),
  sets: z.number().int().min(1),
  reps: z.union([z.string(), z.number()]),
  intensity: z.string(),
  rest: z.union([z.string(), z.number().int().nonnegative()]),
  tempo: z.string().nullable(),
  notes: z.string().nullable(),
});

export const workoutPlanSchema = z.object({
  programName: z.string(),
  trainingFocus: z.string(),
  programType: z.string(),
  cycleLengthWeeks: z.number().int().positive(),
  startDate: z.string(),
  endDate: z.string(),
  athleteProfile: z.object({
    summary: z.string(),
    primaryGoals: z.array(z.string()).min(1),
    constraints: z.array(z.string()),
  }),
  methodology: z.object({
    periodizationModel: z.string(),
    volumeStrategy: z.string(),
    intensityStrategy: z.string(),
    frequencyStrategy: z.string(),
  }),
  phases: z
    .array(
      z.object({
        name: z.string(),
        startWeek: z.number().int().min(1),
        endWeek: z.number().int().min(1),
        objectives: z.array(z.string()).min(1),
        keyMetrics: z.array(z.string()).min(1),
        deloadWeek: z.number().int().nullable(),
      })
    )
    .min(1),
  weeks: z
    .array(
      z.object({
        week: z.number().int().min(1),
        focus: z.string(),
        keyOutcomes: z.array(z.string()).min(1),
        sessions: z
          .array(
            z.object({
              day: z.string(),
              emphasis: z.string(),
              sessionMinutes: z.number().int().positive(),
              readinessCues: z.array(z.string()).default([]),
              mainLifts: z.array(sessionLiftSchema).min(1),
              accessoryWork: z
                .array(
                  z.object({
                    name: z.string(),
                    sets: z.number().int().min(1),
                    reps: z.union([z.number(), z.string()]),
                    notes: z.string().nullable(),
                  })
                )
                .default([]),
              conditioning: z
                .array(
                  z.object({
                    modality: z.string(),
                    durationMinutes: z.number().int().positive(),
                    notes: z.string().nullable(),
                  })
                )
                .default([]),
              recovery: z.array(z.string()).default([]),
            })
          )
          .min(1),
      })
    )
    .min(1),
  monitoring: z.object({
    readinessChecks: z.array(z.string()).min(1),
    nutritionFocus: z.array(z.string()).min(1),
    recoveryProtocols: z.array(z.string()).min(1),
  }),
  coachingNotes: z.array(z.string()).min(1),
});

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type WorkoutWeek = WorkoutPlan['weeks'][number];
export type WorkoutSession = WorkoutWeek['sessions'][number];
export type SessionLift = WorkoutSession['mainLifts'][number];
export type AccessoryLift = WorkoutSession['accessoryWork'][number];
export type ConditioningBlock = WorkoutSession['conditioning'][number];
```}