import React from 'react';
import { View } from 'react-native';
import { Txt } from './Text';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <Txt style={{ fontSize: 48, marginBottom: 16 }}>{icon}</Txt>
      <Txt variant="display" size={18} color="secondary" style={{ textAlign: 'center', marginBottom: 6 }}>{title}</Txt>
      {subtitle && <Txt variant="bodyItalic" size={14} color="tertiary" style={{ textAlign: 'center', lineHeight: 22 }}>{subtitle}</Txt>}
    </View>
  );
}
