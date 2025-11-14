import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';
import { format } from 'date-fns';

import type { StoredWorkoutPlan } from '../../types/database';

interface WorkoutPlanCardProps {
  plan: StoredWorkoutPlan;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WorkoutPlanCard = React.memo(function WorkoutPlanCard({ plan, onPress, onDelete }: WorkoutPlanCardProps) {
  const planDetails = plan.responsePayload;
  const request = plan.requestPayload;

  return (
    <Card style={styles.card} onPress={() => onPress(plan.id)}>
      <Card.Title
        title={planDetails?.programName ?? 'Untitled Program'}
        subtitle={plan.createdAt ? `Created ${format(new Date(plan.createdAt), 'MMM d, yyyy')}` : undefined}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete"
            onPress={() => onDelete(plan.id)}
            accessibilityLabel="Delete workout plan"
          />
        )}
      />
      {planDetails && request && (
        <Card.Content>
          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={styles.metaText}>
              {request.trainingFocus} • {request.experienceLevel}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              {planDetails.weeks.length} weeks • {request.sessionsPerWeek}x/week
            </Text>
          </View>
        </Card.Content>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  metaRow: {
    gap: 4,
  },
  metaText: {
    color: '#666',
  },
});
