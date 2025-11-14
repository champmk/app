"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { submitWorkoutGeneration, updateFeatureSelection } from "@/app/actions";
import Stepper, { Step } from "@/components/Stepper";

type ModuleSelection = {
  calendar: boolean;
  journal: boolean;
  aiWorkout: boolean;
  sleep: boolean;
};

type ModuleKey = keyof ModuleSelection;

type ModuleOnboardingProps = {
  initialSelection: ModuleSelection | null;
  initialStep?: number;
  forceWorkoutStep?: boolean;
};

type WorkoutFormState = {
  programName: string;
  cycleLengthWeeks: string;
  trainingFocus: string;
  sessionLengthMinutes: string;
  experienceLevel: string;
  startDate: string;
  goals: string;
  injuries: string;
  equipment: string;
  trainingFrequency: string;
  squatMax: string;
  benchMax: string;
  deadliftMax: string;
};

type WorkoutStepConfig = {
  id: string;
  description: string;
  optional: boolean;
  validate: () => boolean;
  render: () => JSX.Element;
};

type StepDefinition = { kind: "module" } | { kind: "workout"; config: WorkoutStepConfig };

const DEFAULT_SELECTION: ModuleSelection = {
  calendar: false,
  journal: false,
  aiWorkout: false,
  sleep: false,
};

const MODULES: Array<{ key: ModuleKey; title: string; description: string }> = [
  {
    key: "calendar",
    title: "Adaptive Calendar",
    description: "Plot generated sessions, reflections, and follow-ups on one timeline.",
  },
  {
    key: "journal",
    title: "Training Journal",
    description: "Capture readiness, intent, and debriefs to tighten feedback loops.",
  },
  {
    key: "aiWorkout",
    title: "AI Workout Programmer",
    description: "Build periodized blocks driven by the intake you provide here.",
  },
  {
    key: "sleep",
    title: "Sleep Insights",
    description: "Monitor recovery debt and highlight nights that might limit training.",
  },
];

const CYCLE_LENGTH_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const FOCUS_OPTIONS = ["Powerlifting", "Bodybuilding", "General Fitness"] as const;

export default function ModuleOnboarding({ initialSelection, initialStep = 1, forceWorkoutStep = false }: ModuleOnboardingProps) {
  const router = useRouter();

  const [selection, setSelection] = useState<ModuleSelection>(initialSelection ?? DEFAULT_SELECTION);
  const [includeWorkoutSteps, setIncludeWorkoutSteps] = useState<boolean>(forceWorkoutStep || Boolean(initialSelection?.aiWorkout));
  const [savingSelection, setSavingSelection] = useState(false);
  const [submittingWorkout, setSubmittingWorkout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [workoutForm, setWorkoutForm] = useState<WorkoutFormState>({
    programName: "",
    cycleLengthWeeks: CYCLE_LENGTH_OPTIONS[CYCLE_LENGTH_OPTIONS.length - 1],
    trainingFocus: FOCUS_OPTIONS[0],
    sessionLengthMinutes: "60",
    experienceLevel: "",
    startDate: "",
    goals: "",
    injuries: "",
    equipment: "",
    trainingFrequency: "4",
    squatMax: "",
    benchMax: "",
    deadliftMax: "",
  });

  const shouldShowModuleStep = !forceWorkoutStep;
  const resolvedInitialStep = shouldShowModuleStep ? initialStep ?? 1 : 1;
  const [currentStep, setCurrentStep] = useState<number>(resolvedInitialStep);

  const ensureAtLeastOneSelected = () => Object.values(selection).some(Boolean);

  const handleModuleToggle = (key: ModuleKey) => {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleWorkoutInputChange = (field: keyof WorkoutFormState, value: string) => {
    setWorkoutForm((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const persistFeatureSelection = async () => {
    setSavingSelection(true);
    try {
      const formData = new FormData();
      if (selection.calendar) formData.append("calendar", "on");
      if (selection.journal) formData.append("journal", "on");
      if (selection.aiWorkout) formData.append("aiWorkout", "on");
      if (selection.sleep) formData.append("sleep", "on");
      await updateFeatureSelection(formData);
    } finally {
      setSavingSelection(false);
    }
  };

  const submitWorkoutPlan = async () => {
    setSubmittingWorkout(true);
    try {
      const formData = new FormData();
      formData.append("programName", workoutForm.programName);
      formData.append("cycleLengthWeeks", workoutForm.cycleLengthWeeks);
      formData.append("trainingFocus", workoutForm.trainingFocus);
      formData.append("sessionLengthMinutes", workoutForm.sessionLengthMinutes);
      formData.append("experienceLevel", workoutForm.experienceLevel);
      formData.append("startDate", workoutForm.startDate);
      formData.append("goals", workoutForm.goals);
      if (workoutForm.injuries.trim()) formData.append("injuries", workoutForm.injuries);
      formData.append("equipment", workoutForm.equipment);
      formData.append("trainingFrequency", workoutForm.trainingFrequency);
      if (workoutForm.squatMax.trim()) formData.append("squatMax", workoutForm.squatMax);
      if (workoutForm.benchMax.trim()) formData.append("benchMax", workoutForm.benchMax);
      if (workoutForm.deadliftMax.trim()) formData.append("deadliftMax", workoutForm.deadliftMax);
      await submitWorkoutGeneration(formData);
    } finally {
      setSubmittingWorkout(false);
    }
  };

  const workoutStepConfigs: WorkoutStepConfig[] = [
    {
      id: "programName",
      description: "Give your block a distinct name so you can reference it later.",
      optional: false,
      validate: () => {
        if (!workoutForm.programName.trim()) {
          setErrorMessage("Enter a program name to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Program Name</span>
          <input
            required
            value={workoutForm.programName}
            onChange={(event) => handleWorkoutInputChange("programName", event.target.value)}
            placeholder="e.g., Resilient Strength Build"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "cycleLengthWeeks",
      description: "Select how many weeks you want this block to span (1-12 weeks).",
      optional: false,
      validate: () => {
        const weeks = Number(workoutForm.cycleLengthWeeks);
        if (!Number.isInteger(weeks) || weeks < 1 || weeks > 12) {
          setErrorMessage("Select a program length between 1 and 12 weeks.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Program Length (weeks)</span>
          <select
            value={workoutForm.cycleLengthWeeks}
            onChange={(event) => handleWorkoutInputChange("cycleLengthWeeks", event.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          >
            {CYCLE_LENGTH_OPTIONS.map((weeks) => (
              <option key={weeks} value={weeks}>
                {weeks}
              </option>
            ))}
          </select>
        </label>
      ),
    },
    {
      id: "trainingFocus",
      description: "Align the plan to the primary training discipline you care about.",
      optional: false,
      validate: () => {
        if (!FOCUS_OPTIONS.includes(workoutForm.trainingFocus as (typeof FOCUS_OPTIONS)[number])) {
          setErrorMessage("Choose a training focus to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Training Focus</span>
          <select
            value={workoutForm.trainingFocus}
            onChange={(event) => handleWorkoutInputChange("trainingFocus", event.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          >
            {FOCUS_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      ),
    },
    {
      id: "sessionLengthMinutes",
      description: "Keep sessions close to your available training time.",
      optional: false,
      validate: () => {
        const minutes = Number(workoutForm.sessionLengthMinutes);
        if (!Number.isFinite(minutes) || minutes < 15 || minutes > 180) {
          setErrorMessage("Set session length between 15 and 180 minutes.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Session Length (minutes)</span>
          <input
            required
            type="number"
            min={15}
            max={180}
            value={workoutForm.sessionLengthMinutes}
            onChange={(event) => handleWorkoutInputChange("sessionLengthMinutes", event.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "experienceLevel",
      description: "Share training maturity so volume and intensity scale appropriately.",
      optional: false,
      validate: () => {
        if (!workoutForm.experienceLevel.trim()) {
          setErrorMessage("Describe your experience level to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Experience Level</span>
          <input
            required
            value={workoutForm.experienceLevel}
            onChange={(event) => handleWorkoutInputChange("experienceLevel", event.target.value)}
            placeholder="e.g., Intermediate lifter"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "startDate",
      description: "Anchor the block to its start date so microcycles align with your calendar.",
      optional: false,
      validate: () => {
        if (!workoutForm.startDate.trim()) {
          setErrorMessage("Select a start date to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Start Date</span>
          <input
            required
            type="date"
            value={workoutForm.startDate}
            onChange={(event) => handleWorkoutInputChange("startDate", event.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "goals",
      description: "Outline the outcomes and competitive priorities guiding this block.",
      optional: false,
      validate: () => {
        if (!workoutForm.goals.trim()) {
          setErrorMessage("Add your primary goals to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Primary Goals</span>
          <textarea
            required
            rows={3}
            value={workoutForm.goals}
            onChange={(event) => handleWorkoutInputChange("goals", event.target.value)}
            placeholder="Outline specific outcomes, competition prep, or health milestones"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "injuries",
      description: "Optional: call out movement restrictions or recovery considerations.",
      optional: true,
      validate: () => true,
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Existing Injuries / Considerations</span>
          <textarea
            rows={3}
            value={workoutForm.injuries}
            onChange={(event) => handleWorkoutInputChange("injuries", event.target.value)}
            placeholder="Optional — note movement restrictions or rehab constraints"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "equipment",
      description: "List the equipment you have access to so prescriptions stay realistic.",
      optional: false,
      validate: () => {
        if (!workoutForm.equipment.trim()) {
          setErrorMessage("List available equipment to continue.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Available Equipment</span>
          <textarea
            required
            rows={3}
            value={workoutForm.equipment}
            onChange={(event) => handleWorkoutInputChange("equipment", event.target.value)}
            placeholder="List key equipment or limitations"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "trainingFrequency",
      description: "Specify how many sessions per week the plan should schedule.",
      optional: false,
      validate: () => {
        const frequency = Number(workoutForm.trainingFrequency);
        if (!Number.isInteger(frequency) || frequency < 1 || frequency > 7) {
          setErrorMessage("Set weekly training frequency between 1 and 7 sessions.");
          return false;
        }
        return true;
      },
      render: () => (
        <label className="flex flex-col gap-2 text-sm">
          <span>Weekly Training Frequency</span>
          <input
            required
            type="number"
            min={1}
            max={7}
            value={workoutForm.trainingFrequency}
            onChange={(event) => handleWorkoutInputChange("trainingFrequency", event.target.value)}
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
          />
        </label>
      ),
    },
    {
      id: "powerliftingStats",
      description: "Optional: add 1RM data to calibrate intensities for the big three.",
      optional: true,
      validate: () => true,
      render: () => (
        <fieldset className="rounded-xl border border-white/10 p-4 text-sm">
          <legend className="px-2 text-xs uppercase tracking-wider text-white/60">Powerlifting Stats (optional)</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span>Squat 1RM</span>
              <input
                value={workoutForm.squatMax}
                onChange={(event) => handleWorkoutInputChange("squatMax", event.target.value)}
                placeholder="e.g., 365 lbs"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Bench 1RM</span>
              <input
                value={workoutForm.benchMax}
                onChange={(event) => handleWorkoutInputChange("benchMax", event.target.value)}
                placeholder="e.g., 245 lbs"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Deadlift 1RM</span>
              <input
                value={workoutForm.deadliftMax}
                onChange={(event) => handleWorkoutInputChange("deadliftMax", event.target.value)}
                placeholder="e.g., 405 lbs"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-indigo-400"
              />
            </label>
          </div>
        </fieldset>
      ),
    },
  ];

  const stepsToRender: StepDefinition[] = [];

  if (shouldShowModuleStep) {
    stepsToRender.push({ kind: "module" });
  }

  if (!shouldShowModuleStep || includeWorkoutSteps) {
    workoutStepConfigs.forEach((config) => stepsToRender.push({ kind: "workout", config }));
  }

  const totalSteps = stepsToRender.length;

  const handleStepNext = async (step: number) => {
    const stepIndex = step - 1;
    const stepDefinition = stepsToRender[stepIndex];

    if (!stepDefinition) {
      return false;
    }

    if (stepDefinition.kind === "module") {
      if (savingSelection) {
        return false;
      }
      if (!ensureAtLeastOneSelected()) {
        setErrorMessage("Select at least one module to continue.");
        return false;
      }
      setErrorMessage(null);
      try {
        await persistFeatureSelection();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to save selection. Try again.");
        return false;
      }
      if (!selection.aiWorkout) {
        router.push("/dashboard");
        router.refresh();
        return false;
      }
      setIncludeWorkoutSteps(true);
      return true;
    }

    if (!stepDefinition.config.validate()) {
      return false;
    }

    setErrorMessage(null);

    const isLastStep = stepIndex === stepsToRender.length - 1;
    if (isLastStep) {
      if (submittingWorkout) {
        return false;
      }
      try {
        await submitWorkoutPlan();
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to generate the workout plan. Try again.");
        return false;
      }
      return false;
    }

    return true;
  };

  const activeStepDefinition =
    totalSteps > 0 ? stepsToRender[Math.min(Math.max(currentStep - 1, 0), totalSteps - 1)] : null;

  const nextButtonDisabled =
    (activeStepDefinition?.kind === "module" && savingSelection) ||
    (activeStepDefinition?.kind === "workout" && currentStep === totalSteps && submittingWorkout);

  if (totalSteps === 0) {
    return null;
  }

  return (
    <div className="flex w-full justify-center">
      <Stepper
        initialStep={resolvedInitialStep}
        onStepChange={(step) => {
          setCurrentStep(step);
          setErrorMessage(null);
        }}
        onStepNext={handleStepNext}
        nextButtonText="Next"
        backButtonText="Previous"
        nextButtonProps={{ disabled: nextButtonDisabled }}
        footerClassName="mt-6"
        disableStepIndicators
      >
        {stepsToRender.map((definition) => {
          if (definition.kind === "module") {
            return (
              <Step key="module-selection">
                <div className="flex flex-col gap-6 text-left text-white">
                  <div className="space-y-2 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Module Selection</p>
                    <h2 className="text-2xl font-semibold">Choose your Neural Adapt modules</h2>
                    <p className="text-sm text-white/70">
                      Toggle the experiences you want to explore first. You can always adjust these inside the dashboard later on.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {MODULES.map((module) => {
                      const selected = selection[module.key];
                      return (
                        <label
                          key={module.key}
                          className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                            selected
                              ? "border-emerald-400/70 bg-white/10 backdrop-blur"
                              : "border-white/10 bg-black/30 hover:border-white/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-emerald-500"
                            checked={selected}
                            onChange={() => handleModuleToggle(module.key)}
                          />
                          <span>
                            <span className="block text-base font-semibold text-white">{module.title}</span>
                            <span className="mt-1 block text-sm text-white/70">{module.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errorMessage ? <p className="text-center text-sm text-rose-300">{errorMessage}</p> : null}
                </div>
              </Step>
            );
          }

          const { config } = definition;
          const descriptionText = config.optional ? `${config.description} (optional)` : config.description;
          const showWorkoutHeader = config.id === "programName";

          return (
            <Step key={config.id}>
              <div className="flex flex-col gap-6 text-left text-white">
                <div className="space-y-2 text-center">
                  {showWorkoutHeader ? (
                    <>
                      <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">AI Workout Programmer</p>
                      <h2 className="text-2xl font-semibold">Dial in your training blueprint</h2>
                    </>
                  ) : null}
                  <p className="text-sm text-white/70">{descriptionText}</p>
                </div>
                <div className="mx-auto w-full max-w-md">{config.render()}</div>
                {errorMessage ? <p className="text-center text-sm text-rose-300">{errorMessage}</p> : null}
              </div>
            </Step>
          );
        })}
      </Stepper>
    </div>
  );
}
