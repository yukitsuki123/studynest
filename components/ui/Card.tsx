import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated, style, ...props }: CardProps) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: t.border2,
          ...(elevated ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 } : {}),
        },
        style,
      ]}
      {...props}
    />
  );
}
