import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

interface WeekSelectorProps {
  weeks: Array<{ weekNumber: number }>;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeekSelector({ weeks, selectedIndex, onSelect }: WeekSelectorProps) {
  return (
    <>
      <Text variant="titleMedium" style={styles.title}>
        Select Week
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekSelector}
      >
        {weeks.map((week, index) => (
          <Chip
            key={week.weekNumber}
            selected={selectedIndex === index}
            onPress={() => onSelect(index)}
            style={styles.weekChip}
            mode={selectedIndex === index ? 'flat' : 'outlined'}
          >
            Week {week.weekNumber}
          </Chip>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  weekSelector: {
    paddingHorizontal: 16,
    gap: 8,
  },
  weekChip: {
    marginRight: 0,
  },
});
