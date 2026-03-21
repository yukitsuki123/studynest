import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
}

export function Toggle({ value, onToggle }: ToggleProps) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: [t.bg3, t.accent] });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: bgColor, justifyContent: 'center', borderWidth: 1, borderColor: t.border }}>
        <Animated.View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', transform: [{ translateX }], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }} />
      </Animated.View>
    </TouchableOpacity>
  );
}
