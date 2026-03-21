import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Txt } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ label, variant = 'primary', size = 'md', loading, icon, style, disabled, ...props }: ButtonProps) {
  const t = useTheme();

  const bgMap = {
    primary:   t.accent,
    secondary: t.card2,
    ghost:     'transparent',
    danger:    t.red,
  };
  const textColorMap = {
    primary:   '#FFFFFF',
    secondary: t.text,
    ghost:     t.accent,
    danger:    '#FFFFFF',
  };
  const borderMap = {
    primary:   t.accent,
    secondary: t.border,
    ghost:     'transparent',
    danger:    t.red,
  };
  const paddingMap = { sm: { paddingVertical: 8, paddingHorizontal: 16 }, md: { paddingVertical: 13, paddingHorizontal: 20 }, lg: { paddingVertical: 16, paddingHorizontal: 24 } };
  const fontSizeMap = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: bgMap[variant],
          borderRadius: 10,
          borderWidth: 1,
          borderColor: borderMap[variant],
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          ...paddingMap[size],
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColorMap[variant]} />
      ) : (
        <>
          {icon}
          <Txt variant="bodySemi" style={{ color: textColorMap[variant], fontSize: fontSizeMap[size] }}>
            {label}
          </Txt>
        </>
      )}
    </TouchableOpacity>
  );
}
