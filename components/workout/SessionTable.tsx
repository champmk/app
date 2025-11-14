import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

import type { SessionLift } from '../../types/workout';

interface SessionTableProps {
  lifts: SessionLift[];
}

export function SessionTable({ lifts }: SessionTableProps) {
  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title style={styles.exerciseColumn}>Exercise</DataTable.Title>
        <DataTable.Title numeric style={styles.smallColumn}>
          Sets
        </DataTable.Title>
        <DataTable.Title numeric style={styles.smallColumn}>
          Reps
        </DataTable.Title>
        <DataTable.Title numeric style={styles.mediumColumn}>
          Intensity
        </DataTable.Title>
      </DataTable.Header>

      {lifts.map((lift, index) => (
        <DataTable.Row key={`${lift.name}-${index}`}>
          <DataTable.Cell style={styles.exerciseColumn}>
            <View>
              <Text variant="bodyMedium">{lift.name}</Text>
              <Text variant="bodySmall" style={styles.detailText}>
                Rest: {lift.rest}
              </Text>
              {lift.tempo && (
                <Text variant="bodySmall" style={styles.detailText}>
                  Tempo: {lift.tempo}
                </Text>
              )}
              {lift.notes && (
                <Text variant="bodySmall" style={styles.liftNotes}>
                  {lift.notes}
                </Text>
              )}
            </View>
          </DataTable.Cell>
          <DataTable.Cell numeric style={styles.smallColumn}>
            {lift.sets}
          </DataTable.Cell>
          <DataTable.Cell numeric style={styles.smallColumn}>
            {lift.reps}
          </DataTable.Cell>
          <DataTable.Cell numeric style={styles.mediumColumn}>
            <Text variant="bodySmall">{lift.intensity}</Text>
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
}

const styles = StyleSheet.create({
  exerciseColumn: {
    flex: 2,
  },
  smallColumn: {
    flex: 0.5,
    justifyContent: 'center',
  },
  mediumColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  liftNotes: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  detailText: {
    color: '#757575',
  },
});
