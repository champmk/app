import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#c00',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  text: {
    color: '#c00',
  },
});
