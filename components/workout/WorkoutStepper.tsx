import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, ProgressBar, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { ErrorBanner } from '../ui/ErrorBanner';

export interface WorkoutStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  validate: () => Promise<boolean> | boolean;
  onNext?: () => Promise<void> | void;
}

interface WorkoutStepperProps {
  steps: WorkoutStep[];
  onComplete: () => Promise<void>;
}

export function WorkoutStepper({ steps, onComplete }: WorkoutStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const progress = steps.length > 0 ? (currentStep + 1) / steps.length : 0;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const isValid = await steps[currentStep].validate();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      if (steps[currentStep].onNext) {
        await steps[currentStep].onNext?.();
      }

      if (isLastStep) {
        await onComplete();
        router.replace('/(tabs)');
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setError(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Surface style={styles.header} elevation={1}>
        <View style={styles.progressContainer}>
          <Text variant="labelSmall" style={styles.stepCounter}>
            Step {currentStep + 1} of {steps.length}
          </Text>
          <ProgressBar progress={progress} style={styles.progressBar} />
        </View>
      </Surface>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          {steps[currentStep]?.title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {steps[currentStep]?.description}
        </Text>

        {error && <ErrorBanner message={error} />}

        {CurrentStepComponent && <CurrentStepComponent />}
      </ScrollView>

      <Surface style={styles.footer} elevation={2}>
        <View style={styles.buttonContainer}>
          {!isFirstStep && (
            <Button mode="outlined" onPress={handleBack} disabled={isLoading} style={styles.button}>
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={handleNext}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.button, styles.nextButton]}
          >
            {isLastStep ? 'Generate Workout' : 'Next'}
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 16,
  },
  stepCounter: {
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  nextButton: {},
});
