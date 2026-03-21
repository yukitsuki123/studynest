import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Txt } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, style, ...props }: InputProps) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{label}</Txt>}
      <TextInput
        placeholderTextColor={t.text3}
        style={[
          {
            backgroundColor: t.bg2,
            borderWidth: 1,
            borderColor: t.border,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontFamily: 'CrimsonPro_400Regular',
            fontSize: 15,
            color: t.text,
          },
          style,
        ]}
        {...props}
      />
      {hint && <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginTop: 4 }}>{hint}</Txt>}
    </View>
  );
}
