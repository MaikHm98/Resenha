import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../theme';

type Option<T extends string> = {
  code: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
};

export default function OptionSelector<T extends string>({ options, selectedValue, onSelect }: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.code === selectedValue;
        return (
          <TouchableOpacity
            key={option.code}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onSelect(option.code)}
            activeOpacity={0.85}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  option: {
    borderWidth: 1,
    borderColor: '#2e5c44',
    backgroundColor: '#173425',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionActive: {
    borderColor: '#7CFF4F',
    backgroundColor: '#214531',
  },
  optionText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#B6FF00',
    fontWeight: '800',
  },
});
