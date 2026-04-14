import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('screen');

export function StarryBackground() {
  const t = useTheme();

  // Generate a steady set of stars based on screen size, only once.
  const stars = useMemo(() => {
    const arr = [];
    const numStars = 40; // subtle amount
    for (let i = 0; i < numStars; i++) {
      arr.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    return arr;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: t.text,
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}
