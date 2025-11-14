import React, { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { WorkoutPlanViewer } from '../../components/workout/WorkoutPlanViewer';
import { getWorkoutPlanById } from '../../services/storage';
import type { StoredWorkoutPlan } from '../../types/database';
import type { WorkoutPlan } from '../../types/workout';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState<StoredWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    try {
      if (typeof id !== 'string') {
        throw new Error('Invalid plan identifier');
      }
      const loadedPlan = await getWorkoutPlanById(id);
      setPlan(loadedPlan);
    } catch (error) {
      console.error('Failed to load plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!plan?.responsePayload) {
      return;
    }

    try {
      const fileUri = await generateExcelFile(plan.responsePayload);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sharing not available', 'Unable to share on this device');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Could not export workout plan');
    }
  };

  const handleShare = async () => {
    if (!plan?.responsePayload) {
      return;
    }

    try {
      await Share.share({
        message: `Check out my ${plan.responsePayload.programName} workout plan!`,
        title: plan.responsePayload.programName,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!plan?.responsePayload) {
    return (
      <View style={styles.errorContainer}>
        <Text>Plan not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: plan.responsePayload.programName,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button onPress={handleShare}>Share</Button>
              <Button onPress={handleExport}>Export</Button>
            </View>
          ),
        }}
      />
      <WorkoutPlanViewer plan={plan.responsePayload} />
    </>
  );
}

async function generateExcelFile(plan: WorkoutPlan): Promise<string> {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    { Key: 'Program', Value: plan.programName },
    { Key: 'Focus', Value: plan.programType },
    { Key: 'Training Focus', Value: plan.trainingFocus },
    { Key: 'Weeks', Value: plan.weeks.length },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const sessions: Array<Record<string, string | number>> = [];
  plan.weeks.forEach((week) => {
    week.sessions.forEach((session) => {
      session.mainLifts.forEach((lift) => {
        sessions.push({
          Week: week.week,
          Session: session.day,
          Exercise: lift.name,
          Sets: lift.sets,
          Reps: typeof lift.reps === 'number' ? lift.reps : lift.reps,
          Intensity: lift.intensity ?? '',
          Tempo: lift.tempo ?? '',
          Rest: typeof lift.rest === 'number' ? lift.rest : lift.rest,
          Notes: lift.notes ?? '',
        });
      });
    });
  });

  const sessionsSheet = XLSX.utils.json_to_sheet(sessions);
  XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Sessions');

  const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const safeName = plan.programName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  // Use new File API from expo-file-system v19+
  const file = new FileSystem.File(FileSystem.Paths.cache, `plan-${safeName}.xlsx`);
  
  // Decode base64 to Uint8Array and write
  const base64Decoded = Uint8Array.from(atob(wbout), c => c.charCodeAt(0));
  const writer = file.writableStream().getWriter();
  await writer.write(base64Decoded);
  await writer.close();
  
  return file.uri;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
