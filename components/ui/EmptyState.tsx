import React from 'react';
import { View } from 'react-native';
import { Txt } from './Text';

import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 32 }}>
      <Feather name={icon} size={48} color={t.text3} style={{ marginBottom: 16, opacity: 0.6 }} />
      <Txt variant="display" size={18} color="secondary" style={{ textAlign: 'center', marginBottom: 6 }}>{title}</Txt>
      {subtitle && <Txt variant="bodyItalic" size={14} color="tertiary" style={{ textAlign: 'center', lineHeight: 22 }}>{subtitle}</Txt>}
    </View>
  );
}
