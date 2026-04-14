import { ThemeColors } from '../constants/types';
import { useSettings } from '../context/SettingsContext';

export function useTheme(): ThemeColors & { getContrastColor: (hex: string) => string } {
  const colors = useSettings().colors;
  
  const getContrastColor = (hex?: string) => {
    if (!hex) return '#ffffff';
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140 ? '#000000' : '#ffffff';
  };

  return { ...colors, getContrastColor };
}
