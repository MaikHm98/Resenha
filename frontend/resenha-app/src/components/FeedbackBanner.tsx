import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../theme';

type FeedbackVariant = 'error' | 'success' | 'warning' | 'info';

type Props = {
  variant: FeedbackVariant;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

const variantMap: Record<FeedbackVariant, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  error: { icon: 'alert-circle-outline', color: Colors.danger },
  success: { icon: 'checkmark-circle-outline', color: Colors.success },
  warning: { icon: 'warning-outline', color: Colors.gold },
  info: { icon: 'information-circle-outline', color: Colors.primary },
};

export default function FeedbackBanner({ variant, message, actionLabel, onActionPress }: Props) {
  const config = variantMap[variant];

  return (
    <View style={[styles.box, { borderColor: `${config.color}66` }]}>
      <View style={styles.row}>
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      </View>
      {actionLabel && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  message: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  action: {
    marginTop: 6,
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
