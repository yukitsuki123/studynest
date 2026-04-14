import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';

interface ThemedTextProps extends TextProps {
  variant?: 'display' | 'displayItalic' | 'body' | 'bodyItalic' | 'bodySemi' | 'mono' | 'monoMedium';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'accent2' | 'accent3';
  size?: number;
}

const FONT_SETS: Record<string, Record<string, string>> = {
  lora: {
    display:'Lora_600SemiBold', displayItalic:'Lora_600SemiBold_Italic',
    body:'CrimsonPro_400Regular', bodyItalic:'CrimsonPro_400Regular_Italic', bodySemi:'CrimsonPro_600SemiBold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
  crimson: {
    display:'CrimsonPro_600SemiBold', displayItalic:'CrimsonPro_400Regular_Italic',
    body:'CrimsonPro_400Regular', bodyItalic:'CrimsonPro_400Regular_Italic', bodySemi:'CrimsonPro_600SemiBold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
  spectral: {
    display:'Spectral_600SemiBold', displayItalic:'Spectral_600SemiBold_Italic',
    body:'Spectral_400Regular', bodyItalic:'Spectral_400Regular_Italic', bodySemi:'Spectral_600SemiBold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
  merriweather: {
    display:'Merriweather_700Bold', displayItalic:'Merriweather_700Bold_Italic',
    body:'Merriweather_400Regular', bodyItalic:'Merriweather_400Regular_Italic', bodySemi:'Merriweather_700Bold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
  eb_garamond: {
    display:'EBGaramond_600SemiBold', displayItalic:'EBGaramond_600SemiBold_Italic',
    body:'EBGaramond_400Regular', bodyItalic:'EBGaramond_400Regular_Italic', bodySemi:'EBGaramond_600SemiBold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
  cormorant: {
    display:'Cormorant_600SemiBold', displayItalic:'Cormorant_600SemiBold_Italic',
    body:'Cormorant_400Regular', bodyItalic:'Cormorant_400Regular_Italic', bodySemi:'Cormorant_600SemiBold',
    mono:'JetBrainsMono_400Regular', monoMedium:'JetBrainsMono_500Medium',
  },
};

export function Txt({ variant = 'body', color = 'primary', size, style, ...props }: ThemedTextProps) {
  const t = useTheme();
  const { fontFamily, fontSizeMultiplier } = useSettings();
  const fonts = FONT_SETS[fontFamily] ?? FONT_SETS.lora;
  const colorMap = { primary:t.text, secondary:t.text2, tertiary:t.text3, accent:t.accent, accent2:t.accent2, accent3:t.accent3 };
  const baseSize = size ?? 15;
  const scaledSize = Math.round(baseSize * (fontSizeMultiplier || 1.0));
  
  return (
    <RNText
      style={[{ fontFamily: fonts[variant] ?? fonts.body, color: colorMap[color], fontSize: scaledSize }, style]}
      {...props}
    />
  );
}
