import { useSettings } from '../context/SettingsContext';
import { ThemeColors } from '../constants/types';

export function useTheme(): ThemeColors {
  return useSettings().colors;
}
