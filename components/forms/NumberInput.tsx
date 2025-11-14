import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface NumberInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  rules?: ControllerProps<TFieldValues, FieldPath<TFieldValues>>['rules'];
  min?: number;
  max?: number;
  helperText?: string;
  disabled?: boolean;
  suffix?: string;
}

export function NumberInput<TFieldValues extends FieldValues>(props: NumberInputProps<TFieldValues>) {
  const { control, name, label, rules, min, max, helperText, disabled, suffix } = props;

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              label={label}
              value={value === undefined || value === null ? '' : String(value)}
              onChangeText={(text) => {
                const numericValue = text.trim() === '' ? undefined : Number(text);
                if (numericValue !== undefined) {
                  if (Number.isNaN(numericValue)) {
                    onChange(value);
                    return;
                  }
                  if (min !== undefined && numericValue < min) {
                    onChange(min);
                    return;
                  }
                  if (max !== undefined && numericValue > max) {
                    onChange(max);
                    return;
                  }
                }
                onChange(numericValue);
              }}
              onBlur={onBlur}
              keyboardType="numeric"
              mode="outlined"
              disabled={disabled}
              error={!!error}
              right={suffix ? <TextInput.Affix text={suffix} /> : undefined}
            />
            {helperText && !error && <HelperText type="info">{helperText}</HelperText>}
            {error && <HelperText type="error">{error.message}</HelperText>}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
