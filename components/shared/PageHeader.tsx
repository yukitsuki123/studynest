import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Txt } from '../ui/Text';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, rightElement }: PageHeaderProps) {
  const t = useTheme();
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: t.bg }}>
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="chevron-left" size={18} color={t.text2} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Txt variant="display" size={26} style={{ letterSpacing: -0.5, lineHeight: 30 }}>{title}</Txt>
        {subtitle && <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginTop: 2 }}>{subtitle}</Txt>}
      </View>
      {rightElement}
    </View>
  );
}
