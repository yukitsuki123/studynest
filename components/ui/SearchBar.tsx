import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Search } from 'lucide-react-native';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText, ...props }: SearchBarProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 20, marginBottom: 14 }}>
      <Search size={16} color={t.text3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search courses, files…"
        placeholderTextColor={t.text3}
        style={{ flex: 1, fontFamily: 'CrimsonPro_400Regular', fontSize: 15, color: t.text }}
        {...props}
      />
    </View>
  );
}
