import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FAB, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../components/ui/EmptyState';
import { deleteWorkoutPlan, getWorkoutPlans } from '../../services/storage';
import type { StoredWorkoutPlan } from '../../types/database';
import { WorkoutPlanCard } from '../../components/workout/WorkoutPlanCard';

export default function DashboardScreen() {
  const [plans, setPlans] = useState<StoredWorkoutPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const loadedPlans = await getWorkoutPlans();
      setPlans(loadedPlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
      await loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const renderPlanCard = ({ item }: { item: StoredWorkoutPlan }) => {
    return (
      <WorkoutPlanCard
        plan={item}
        onPress={(planId) => router.push(`/plan/${planId}`)}
        onDelete={handleDeletePlan}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          My Workout Plans
        </Text>
      </Surface>

      {plans.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title="No Workout Plans Yet"
          description="Create your first AI-powered workout plan to get started"
          actionLabel="Create Plan"
          onAction={() => router.push('/(tabs)/generate')}
        />
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/generate')}
        label="New Plan"
        accessibilityLabel="Create a new workout plan"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
