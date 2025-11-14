import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

import { WorkoutStepper, type WorkoutStep } from '../../components/workout/WorkoutStepper';
import { SelectInput } from '../../components/forms/SelectInput';
import { NumberInput } from '../../components/forms/NumberInput';
import { TextAreaInput } from '../../components/forms/TextAreaInput';
import { saveWorkoutPlan } from '../../services/storage';
import type { WorkoutRequest } from '../../types/workout';

type FormData = WorkoutRequest;

export default function GenerateScreen() {
  const [formData, setFormData] = useState<Partial<FormData>>({
    trainingFocus: 'General Fitness',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const { control: basicControl, trigger: triggerBasic, getValues: getBasicValues } = useForm<FormData>({
    defaultValues: formData,
  });

  const { control: detailsControl, trigger: triggerDetails, getValues: getDetailsValues } = useForm<FormData>({
    defaultValues: formData,
  });

  const { control: goalsControl, trigger: triggerGoals, getValues: getGoalsValues } = useForm<FormData>({
    defaultValues: formData,
  });

  // Step 1: Basic Information
  const BasicInfoStep = () => (
    <View>
      <TextInput
        label="Program Name"
        value={formData.programName || ''}
        onChangeText={(value) => setFormData({ ...formData, programName: value })}
        mode="outlined"
        style={styles.input}
      />
      
      <SelectInput
        control={basicControl}
        name="trainingFocus"
        label="Training Focus"
        options={[
          { label: 'General Fitness', value: 'General Fitness' },
          { label: 'Powerlifting', value: 'Powerlifting' },
          { label: 'Bodybuilding', value: 'Bodybuilding' },
        ]}
        rules={{ required: 'Training focus is required' }}
      />

      <SelectInput
        control={basicControl}
        name="programType"
        label="Program Type"
        options={[
          { label: 'Microcycle (1-4 weeks)', value: 'Microcycle' },
          { label: 'Mesocycle (4-12 weeks)', value: 'Mesocycle' },
          { label: 'Macrocycle (12+ weeks)', value: 'Macrocycle' },
          { label: 'Block', value: 'Block' },
        ]}
        rules={{ required: 'Program type is required' }}
      />

      <NumberInput
        control={basicControl}
        name="cycleLengthWeeks"
        label="Cycle Length"
        suffix="weeks"
        min={1}
        max={52}
        rules={{
          required: 'Cycle length is required',
          min: { value: 1, message: 'Must be at least 1 week' },
        }}
      />
    </View>
  );

  // Step 2: Training Details
  const TrainingDetailsStep = () => (
    <View>
      <NumberInput
        control={detailsControl}
        name="trainingFrequency"
        label="Training Frequency"
        suffix="sessions/week"
        min={1}
        max={7}
        rules={{
          required: 'Training frequency is required',
          min: { value: 1, message: 'Must be at least 1 session per week' },
        }}
      />

      <NumberInput
        control={detailsControl}
        name="sessionLengthMinutes"
        label="Session Length"
        suffix="minutes"
        min={15}
        max={180}
        rules={{
          required: 'Session length is required',
          min: { value: 15, message: 'Must be at least 15 minutes' },
        }}
      />

      <TextInput
        label="Experience Level"
        value={formData.experienceLevel || ''}
        onChangeText={(value) => setFormData({ ...formData, experienceLevel: value })}
        mode="outlined"
        placeholder="e.g., Beginner, Intermediate, Advanced"
        style={styles.input}
      />

      <TextAreaInput
        control={detailsControl}
        name="equipment"
        label="Available Equipment"
        placeholder="List the equipment you have access to..."
        rules={{ required: 'Equipment information is required' }}
        numberOfLines={3}
      />
    </View>
  );

  // Step 3: Goals & Constraints
  const GoalsStep = () => (
    <View>
      <TextAreaInput
        control={goalsControl}
        name="goals"
        label="Training Goals"
        placeholder="What do you want to achieve with this program?"
        rules={{ required: 'Training goals are required' }}
        numberOfLines={4}
      />

      <TextAreaInput
        control={goalsControl}
        name="injuries"
        label="Injuries or Limitations (Optional)"
        placeholder="Any injuries or physical limitations to consider..."
        numberOfLines={3}
      />

      <Text variant="bodyMedium" style={styles.note}>
        Note: This is a demo version. In production, this would connect to an AI service to generate your personalized workout plan.
      </Text>
    </View>
  );

  const steps: WorkoutStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Set up the foundation of your workout program',
      component: BasicInfoStep,
      validate: async () => {
        const values = getBasicValues();
        setFormData((prev) => ({ ...prev, ...values }));
        return await triggerBasic(['programName', 'trainingFocus', 'programType', 'cycleLengthWeeks']);
      },
    },
    {
      id: 'details',
      title: 'Training Details',
      description: 'Configure your training schedule and preferences',
      component: TrainingDetailsStep,
      validate: async () => {
        const values = getDetailsValues();
        setFormData((prev) => ({ ...prev, ...values }));
        return await triggerDetails(['trainingFrequency', 'sessionLengthMinutes', 'experienceLevel', 'equipment']);
      },
    },
    {
      id: 'goals',
      title: 'Goals & Constraints',
      description: 'Tell us about your fitness goals and any limitations',
      component: GoalsStep,
      validate: async () => {
        const values = getGoalsValues();
        setFormData((prev) => ({ ...prev, ...values }));
        return await triggerGoals(['goals']);
      },
    },
  ];

  const handleComplete = async () => {
    // Combine all form data
    const completeData: WorkoutRequest = {
      programName: formData.programName || 'Untitled Program',
      trainingFocus: formData.trainingFocus || 'General Fitness',
      programType: formData.programType || 'Mesocycle',
      cycleLengthWeeks: formData.cycleLengthWeeks || 8,
      sessionLengthMinutes: formData.sessionLengthMinutes || 60,
      experienceLevel: formData.experienceLevel || 'Intermediate',
      startDate: formData.startDate || format(new Date(), 'yyyy-MM-dd'),
      goals: formData.goals || '',
      injuries: formData.injuries,
      equipment: formData.equipment || '',
      trainingFrequency: formData.trainingFrequency || 3,
      powerliftingStats: formData.powerliftingStats,
    };

    // For now, just save the request without generating a full plan
    // In production, this would call an API to generate the workout plan
    await saveWorkoutPlan(completeData);
  };

  return <WorkoutStepper steps={steps} onComplete={handleComplete} />;
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  note: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    color: '#1565c0',
  },
});
