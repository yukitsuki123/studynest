import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from './Text';
import { useTheme } from '../../hooks/useTheme';

interface ColorPickerProps {
  initialHue: number;
  initialSat: number;
  initialLum: number;
  onColorChange: (h: number, s: number, l: number) => void;
  label?: string;
}

const HUE_COLORS: readonly [string, string, ...string[]] = [
  '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'
];

export function ColorPicker({ initialHue, initialSat, initialLum, onColorChange, label }: ColorPickerProps) {
  const t = useTheme();
  
  const [hue, setHue] = useState(initialHue);
  const [sat, setSat] = useState(initialSat);
  const [lum, setLum] = useState(initialLum);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setHue(initialHue);
    setSat(initialSat);
    setLum(initialLum);
  }, [initialHue, initialSat, initialLum]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const handleHueChange = useCallback((x: number) => {
    if (width === 0) return;
    const newHue = Math.min(360, Math.max(0, Math.round((x / width) * 360)));
    setHue(newHue);
    onColorChange(newHue, sat, lum);
  }, [width, sat, lum, onColorChange]);

  const handleSatChange = useCallback((x: number) => {
    if (width === 0) return;
    const newSat = Math.min(100, Math.max(0, Math.round((x / width) * 100)));
    setSat(newSat);
    onColorChange(hue, newSat, lum);
  }, [width, hue, lum, onColorChange]);

  const handleLumChange = useCallback((x: number) => {
    if (width === 0) return;
    const newLum = Math.min(100, Math.max(0, Math.round((x / width) * 100)));
    setLum(newLum);
    onColorChange(hue, sat, newLum);
  }, [width, hue, sat, onColorChange]);

  const createPanResponder = (handler: (x: number) => void) => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handler(evt.nativeEvent.locationX),
    onPanResponderMove: (evt) => handler(evt.nativeEvent.locationX),
  });

  const huePan = createPanResponder(handleHueChange);
  const satPan = createPanResponder(handleSatChange);
  const lumPan = createPanResponder(handleLumChange);

  return (
    <View style={styles.container}>
      {label && <Txt variant="mono" size={10} color="tertiary" style={styles.label}>{label}</Txt>}
      
      {/* Preview */}
      <View style={[styles.preview, { backgroundColor: `hsl(${hue}, ${sat}%, ${lum}%)` }]}>
         <Txt variant="mono" size={12} style={{ color: lum > 60 ? '#000' : '#fff' }}>
           HSL({hue}, {sat}%, {lum}%)
         </Txt>
      </View>

      {/* Hue Slider */}
      <Txt variant="mono" size={9} color="tertiary" style={styles.subLabel}>HUE</Txt>
      <View style={styles.sliderContainer} onLayout={onLayout}>
        <LinearGradient colors={HUE_COLORS} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} />
        <View 
          {...huePan.panHandlers}
          style={[styles.handle, { left: Math.max(0, Math.min(width - 20, (hue / 360) * width - 10)), borderColor: '#fff' }]} 
        />
      </View>

      {/* Saturation Slider */}
      <Txt variant="mono" size={9} color="tertiary" style={styles.subLabel}>SATURATION</Txt>
      <View style={styles.sliderContainer}>
        <LinearGradient 
          colors={[`hsl(${hue}, 0%, ${lum}%)`, `hsl(${hue}, 100%, ${lum}%)`]} 
          start={{x:0,y:0}} end={{x:1,y:0}} 
          style={StyleSheet.absoluteFill} 
        />
        <View 
          {...satPan.panHandlers}
          style={[styles.handle, { left: Math.max(0, Math.min(width - 20, (sat / 100) * width - 10)), borderColor: '#fff' }]} 
        />
      </View>

      {/* Luminance Slider */}
      <Txt variant="mono" size={9} color="tertiary" style={styles.subLabel}>LUMINANCE</Txt>
      <View style={styles.sliderContainer}>
        <LinearGradient 
          colors={['#000', `hsl(${hue}, ${sat}%, 50%)`, '#fff']} 
          start={{x:0,y:0}} end={{x:1,y:0}} 
          style={StyleSheet.absoluteFill} 
        />
        <View 
          {...lumPan.panHandlers}
          style={[styles.handle, { left: Math.max(0, Math.min(width - 20, (lum / 100) * width - 10)), borderColor: '#fff' }]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  preview: {
    height: 50,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  subLabel: {
    marginBottom: 6,
    letterSpacing: 1,
  },
  sliderContainer: {
    height: 24,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  handle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    backgroundColor: 'transparent',
    zIndex: 10,
  }
});
