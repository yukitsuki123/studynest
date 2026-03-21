import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
}

export function ProgressBar({ progress, height = 4, color }: ProgressBarProps) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 600, useNativeDriver: false }).start();
  }, [progress]);

  return (
    <View style={{ height, backgroundColor: t.bg3, borderRadius: height / 2, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? t.accent,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
