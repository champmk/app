import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';

import { getFeatureSelections, updateFeatureSelections } from '../../services/storage';
import type { FeatureSelectionRecord } from '../../types/database';

export default function ProfileScreen() {
  const [features, setFeatures] = useState<FeatureSelectionRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const selections = await getFeatureSelections();
      setFeatures(selections);
    } catch (error) {
      console.error('Failed to load feature selections:', error);
    }
  };

  const toggleFeature = async (featureKey: 'workoutProgrammer' | 'journaling' | 'calendar') => {
    if (!features) return;
    setLoading(true);
    try {
      const updated = { ...features, [featureKey]: !features[featureKey] };
      setFeatures(updated);
      await updateFeatureSelections({ [featureKey]: updated[featureKey] ? 1 : 0 });
    } catch (error) {
      console.error('Failed to update feature selections:', error);
      await loadPreferences();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Profile & Settings
      </Text>

      <View style={styles.card}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Feature Access
        </Text>
        <View style={styles.toggleRow}>
          <Text variant="bodyMedium">Workout Programmer</Text>
          <Switch
            value={!!features?.workoutProgrammer}
            onValueChange={() => toggleFeature('workoutProgrammer')}
            disabled={loading}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text variant="bodyMedium">Training Journal</Text>
          <Switch
            value={!!features?.journaling}
            onValueChange={() => toggleFeature('journaling')}
            disabled={loading}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text variant="bodyMedium">Calendar Sync</Text>
          <Switch
            value={!!features?.calendar}
            onValueChange={() => toggleFeature('calendar')}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        <TextInput
          label="Name"
          value="Demo User"
          disabled
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Email"
          value="demo@neuraladapt.ai"
          disabled
          mode="outlined"
          style={styles.input}
        />
        <Button mode="outlined" disabled>
          Manage Subscription
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    gap: 16,
  },
  title: {
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
  },
});
