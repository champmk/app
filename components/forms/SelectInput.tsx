import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, HelperText, List, TextInput } from 'react-native-paper';
import {
  Controller,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type SelectOption = {
  label: string;
  value: string;
};

interface SelectInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: SelectOption[];
  rules?: ControllerProps<TFieldValues, FieldPath<TFieldValues>>['rules'];
  helperText?: string;
  disabled?: boolean;
}

export function SelectInput<TFieldValues extends FieldValues>(props: SelectInputProps<TFieldValues>) {
  const { control, name, label, options, rules, helperText, disabled } = props;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <TextInput
                label={label}
                value={options.find((opt) => opt.value === value)?.label ?? ''}
                pointerEvents="none"
                editable={false}
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
                    title="Select an option"
                    right={(props) => (
                      <List.Icon {...props} icon="close" onPress={() => setModalVisible(false)} />
                    )}
                  />
                  <Divider />
                  {options.map((option) => (
                    <List.Item
                      key={option.value}
                      title={option.label}
                      onPress={() => {
                        onChange(option.value);
                        setModalVisible(false);
                      }}
                      left={(props) =>
                        value === option.value ? <List.Icon {...props} icon="check" /> : null
                      }
                    />
                  ))}
                </View>
              </View>
            </Modal>
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
