import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Checkbox, Divider, HelperText, List, TextInput } from 'react-native-paper';
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type MultiSelectOption = {
  label: string;
  value: string;
};

interface MultiSelectInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: MultiSelectOption[];
  rules?: ControllerProps<TFieldValues, FieldPath<TFieldValues>>['rules'];
  helperText?: string;
}

export function MultiSelectInput<TFieldValues extends FieldValues>(props: MultiSelectInputProps<TFieldValues>) {
  const { control, name, label, options, rules, helperText } = props;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          const selectedValues: string[] = Array.isArray(value) ? value : [];

          return (
            <>
              <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7}>
                <TextInput
                  label={label}
                  value={selectedValues.length ? `${selectedValues.length} selected` : ''}
                  editable={false}
                  pointerEvents="none"
                  mode="outlined"
                  error={!!error}
                  right={<TextInput.Icon icon="chevron-down" />}
                />
              </TouchableOpacity>

              {helperText && !error && <HelperText type="info">{helperText}</HelperText>}
              {error && <HelperText type="error">{error.message}</HelperText>}

              <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <List.Item
                      title="Select equipment"
                      right={(props) => (
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                          <List.Icon {...props} icon="close" />
                        </TouchableOpacity>
                      )}
                    />
                    <Divider />
                    <ScrollView>
                      {options.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                          <List.Item
                            key={option.value}
                            title={option.label}
                            onPress={() => {
                              if (isSelected) {
                                onChange(selectedValues.filter((item) => item !== option.value));
                              } else {
                                onChange([...selectedValues, option.value]);
                              }
                            }}
                            left={() => (
                              <Checkbox
                                status={isSelected ? 'checked' : 'unchecked'}
                                onPress={() => {
                                  if (isSelected) {
                                    onChange(selectedValues.filter((item) => item !== option.value));
                                  } else {
                                    onChange([...selectedValues, option.value]);
                                  }
                                }}
                              />
                            )}
                          />
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
});
