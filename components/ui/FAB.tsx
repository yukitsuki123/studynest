import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface FABProps {
  onPress: () => void;
  icon?: React.ElementType;
}

export function FAB({ onPress, icon = Plus }: FABProps) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        position: 'absolute',
        bottom: 36,
        right: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: t.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: t.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      {React.createElement(icon, { size: 22, color: '#fff' })}
    </TouchableOpacity>
  );
}
