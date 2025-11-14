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

interface TextAreaInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  rules?: ControllerProps<TFieldValues, FieldPath<TFieldValues>>['rules'];
  helperText?: string;
  numberOfLines?: number;
}

export function TextAreaInput<TFieldValues extends FieldValues>(props: TextAreaInputProps<TFieldValues>) {
  const { control, name, label, placeholder, rules, helperText, numberOfLines = 4 } = props;

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
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              mode="outlined"
              multiline
              numberOfLines={numberOfLines}
              error={!!error}
              style={styles.textArea}
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
  textArea: {
    textAlignVertical: 'top',
  },
});
